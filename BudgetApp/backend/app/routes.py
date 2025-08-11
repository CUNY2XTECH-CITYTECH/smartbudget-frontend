
#routes.py
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from .models import User, Expense, Transaction, Budget, Stock, Thread, Comment
from . import db
from sqlalchemy import not_
import pandas as pd
from collections import defaultdict
import os
from flask import send_from_directory
import yfinance as yf

main_bp = Blueprint('main', __name__)

# -------------------- Health Check --------------------
# @main_bp.route("/")
# def health_check():
#     return jsonify({"message": "API running"}), 200

# -------------------- Signup --------------------
@main_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        name = data.get('name')
        password = data.get('password')

        if not name or not password:
            return jsonify({"message": "Missing username or password"}), 400

        if User.query.filter_by(username=name).first():
            return jsonify({"message": "Username already taken"}), 400

        hashed_pw = generate_password_hash(password)
        new_user = User(username=name, password=hashed_pw)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "User registered successfully",
            "userID": new_user.userID,
            "username": new_user.username
        }), 201

    except Exception as e:
        import traceback
        traceback.print_exc()  # ✅ This will show you full stack trace in terminal
        return jsonify({"message": "Internal server error", "error": str(e)}), 500



# -------------------- Login --------------------
@main_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    name = data.get('name')
    password = data.get('password')

    user = User.query.filter_by(username=name).first()

    if user and check_password_hash(user.password, password):
        session.permanent = True  # ⬅️ this makes session use the configured timeout
        session['user_id'] = user.userID
        session['username'] = user.username
        return jsonify({"message": "Login successful"}), 200

    return jsonify({"message": "Invalid credentials"}), 401

# -------------------- Logout --------------------
@main_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

# -------------------- Check Logged In --------------------
@main_bp.route('/session', methods=['GET'])
def check_session():
    if 'user_id' in session:
        return jsonify({
            "loggedIn": True,
            "user": session['username']
        })
    return jsonify({"loggedIn": False}), 200

# -------------------- Upload CSV --------------------
@main_bp.route('/upload', methods=['POST'])
def upload_csv():
    if 'user_id' not in session:
        return jsonify({"message": "Unauthorized"}), 401

    file = request.files.get('file')
    if not file or not file.filename.endswith('.csv'):
        return jsonify({"error": "Invalid file"}), 400

    df = pd.read_csv(file)
    for _, row in df.iterrows():
        expense = Expense(
            description=row.get('description'),
            amount=float(row.get('amount', 0)),
            category=row.get('category'),
            date=pd.to_datetime(row.get('date')).date(),
        )
        db.session.add(expense)

    db.session.commit()
    return jsonify({"message": "CSV data uploaded successfully"}), 200

# -------------------- View Expenses --------------------
@main_bp.route('/expenses', methods=['GET'])
def view_expenses():
    expenses = Expense.query.all()
    return jsonify([
        {
            "id": e.id,
            "description": e.description,
            "amount": e.amount,
            "category": e.category,
            "date": e.date.strftime('%Y-%m-%d')
        } for e in expenses
    ])

# -------------------- Chart Data --------------------
@main_bp.route('/expenses/chart-data', methods=['GET'])
def chart_data():
    expenses = Expense.query.all()
    category_totals = defaultdict(float)
    for e in expenses:
        category_totals[e.category] += e.amount

    labels = list(category_totals.keys())
    amounts = list(category_totals.values())

    return jsonify({
        "labels": labels,
        "amounts": amounts
    })

# -------------------- Daily Totals --------------------
@main_bp.route('/expenses/daily', methods=['GET'])
def daily_totals():
    expenses = Expense.query.filter(Expense.category != 'Income').all()
    daily_sum = defaultdict(float)
    for e in expenses:
        daily_sum[e.date.strftime('%Y-%m-%d')] += e.amount

    sorted_dates = sorted(daily_sum.keys())
    values = [daily_sum[date] for date in sorted_dates]

    return jsonify({
        "labels": sorted_dates,
        "amounts": values
    })

#------stocks------

@main_bp.route('/query', methods=['POST'])
def query_yfinance():
    try:
        data = request.get_json()
        print("Incoming data:", data)

        ticker = data.get('ticker')
        period = data.get('period')
        interval = data.get('interval')

        if not all([ticker, period, interval]):
            return jsonify({'error': 'Missing required fields'}), 400

        df = yf.download(ticker, period=period, interval=interval)

# Flatten multi-level columns if they exist
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        print("Flattened DataFrame:\n", df.head())

        if df.empty:
            return jsonify({'error': 'No data found for given input'}), 404

        if 'Close' not in df.columns:
            return jsonify({'error': "'Close' column not found in data"}), 500

        # Drop missing Close values
        df = df.dropna(subset=['Close'])

        # Build chart history
        history = [
            {
                'date': str(index.date()),
                'close': round(float(close), 2)
            }
            for index, close in df['Close'].items()
        ]

        close_prices = df['Close']

        stats = {
            'min': round(close_prices.min().item(), 2),
            'max': round(close_prices.max().item(), 2),
            'average': round(close_prices.mean().item(), 2),
            'std_dev': round(close_prices.std().item(), 2),
            'latest': round(close_prices.iloc[-1].item(), 2)
        }

        result = {
            'ticker': ticker.upper(),
            'history': history,
            'stats': stats
        }

        return jsonify(result)

    except Exception as e:
        print("Error in /api/query:", e)
        return jsonify({'error': str(e)}), 500

@main_bp.route('/threads', methods=['GET'])
def get_threads():
    threads = Thread.query.order_by(Thread.timestamp.desc()).all()
    return jsonify([
        {
            'threadID': t.threadID,
            'title': t.title,
            'content': t.content,
            'userID': t.userID,
            'timestamp': t.timestamp.isoformat()
        } for t in threads
    ]), 200

@main_bp.route('/threads', methods=['POST'])
def create_thread():
    # Require login (session cookie must be present)
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    title = data.get('title', '').strip()
    body  = data.get('body',  '').strip()

    if not title or not body:
        return jsonify({'error': 'Missing required fields'}), 400

    thread = Thread(userID=user_id, title=title, content=body)
    db.session.add(thread)
    db.session.commit()

    return jsonify({
        'threadID': thread.threadID,
        'userID': thread.userID,
        'title': thread.title,
        'content': thread.content,
        'timestamp': thread.timestamp.isoformat()
    }), 201