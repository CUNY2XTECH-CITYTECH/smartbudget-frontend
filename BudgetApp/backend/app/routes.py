
#routes.py
from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from .models import User, Expense, Transaction, Budget, Stock, Thread, Comment
from . import db
from sqlalchemy import not_
import pandas as pd
from collections import defaultdict
import os
from flask import send_from_directory
import yfinance as yf
from flask_login import logout_user
from datetime import date, timedelta
import requests
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
    # If you were using Flask-Login, you'd call logout_user() too.
    session.clear()
    session.modified = True

    resp = jsonify({"message": "Logged out successfully"})

    cookie_name   = current_app.config.get('SESSION_COOKIE_NAME', 'session')
    cookie_path   = current_app.config.get('SESSION_COOKIE_PATH', '/')
    cookie_domain = current_app.config.get('SESSION_COOKIE_DOMAIN', None)
    cookie_samesite = current_app.config.get('SESSION_COOKIE_SAMESITE', None)
    cookie_secure   = current_app.config.get('SESSION_COOKIE_SECURE', False)

    resp.delete_cookie(
        cookie_name,
        path=cookie_path,
        domain=cookie_domain,
        samesite=cookie_samesite,
        secure=cookie_secure,
    )
    return resp, 200



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
    if not file or not file.filename.lower().endswith('.csv'):
        return jsonify({"error": "Invalid file"}), 400

    try:
        df = pd.read_csv(file)
        print("CSV columns:", df.columns.tolist())
        df.columns = [c.strip().lower() for c in df.columns]  # normalize

        required = {'description', 'amount', 'category', 'date'}
        if not required.issubset(set(df.columns)):
            return jsonify({
                "error": "CSV must include columns: description, amount, category, date",
                "found": df.columns.tolist()
            }), 400

        added = 0
        for _, row in df.iterrows():
            try:
                exp = Expense(
                    description=str(row.get('description') or '').strip(),
                    amount=float(row.get('amount') or 0),
                    category=str(row.get('category') or '').strip(),
                    date=pd.to_datetime(row.get('date')).date(),
                    userID=session['user_id']
                )
                db.session.add(exp)
                added += 1
            except Exception as row_err:
                print("Skipping row due to error:", row.to_dict(), row_err)

        db.session.commit()
        return jsonify({"message": f"CSV uploaded successfully ({added} rows)"}), 200
    except Exception as e:
        db.session.rollback()
        print("CSV upload error:", e)
        return jsonify({"error": "Failed to parse CSV"}), 400
    


# -------------------- View Expenses --------------------
@main_bp.route('/expenses', methods=['POST'])
def add_expense():
    if 'user_id' not in session:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json() or {}
    try:
        desc = (data.get('description') or '').strip()
        amount = float(data.get('amount') or 0)
        category = (data.get('category') or '').strip()
        date = pd.to_datetime(data.get('date')).date()

        if not desc or not category:
            return jsonify({"message": "Missing fields"}), 400

        exp = Expense(
            description=desc,
            amount=amount,
            category=category,
            date=date,
            userID=session['user_id']  # ✅ tie to logged-in user
        )
        db.session.add(exp)
        db.session.commit()
        return jsonify({"message": "Added", "id": exp.id}), 201
    except Exception as e:
        db.session.rollback()
        print("Add expense error:", e)
        return jsonify({"message": "Failed to add expense"}), 400

# -------------------- Chart Data --------------------
@main_bp.route('/expenses/chart-data', methods=['GET'])
def chart_data():
    if 'user_id' not in session:
        return jsonify({"message": "Unauthorized"}), 401

    expenses = Expense.query.filter_by(userID=session['user_id']).all()

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
    if 'user_id' not in session:
        return jsonify({"message": "Unauthorized"}), 401

    expenses = Expense.query.filter(
        Expense.userID == session['user_id'],  # ✅ per-user filter
        Expense.category != 'Income'
    ).all()

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

@main_bp.route('/delete', methods=['POST'])
def delete_account():
    if 'user_id' not in session:
        return jsonify({"message": "Unauthorized"}), 401
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({"message": "User not found"}), 404
    db.session.delete(user)
    db.session.commit()
    session.clear()
    return jsonify({"message": "Account deleted successfully"}), 200


@main_bp.route('/news', methods=['GET'])
def company_news():
    symbol = (request.args.get('ticker') or '').upper().strip()
    if not symbol:
        return jsonify({"error": "ticker is required"}), 400

    api_key = current_app.config.get('FINNHUB_API_KEY')
    if not api_key:
        return jsonify({"error": "FINNHUB_API_KEY not configured"}), 500

    # Finnhub requires a from/to window (YYYY-MM-DD). Use last 14 days.
    today = date.today()
    frm = (today - timedelta(days=14)).isoformat()
    to  = today.isoformat()

    try:
        resp = requests.get(
            "https://finnhub.io/api/v1/company-news",
            params={"symbol": symbol, "from": frm, "to": to, "token": api_key},
            timeout=10
        )
        if resp.status_code == 429:
            return jsonify({"items": [], "note": "Rate limited by Finnhub (429). Try again shortly."}), 200
        if not resp.ok:
            # Bubble some detail for debugging
            return jsonify({"items": [], "error": f"finnhub {resp.status_code}"}), 200

        data = resp.json() or []
        # Normalize for frontend (headline, url, source, time in ms)
        items = []
        for it in data:
            if not it.get('headline') or not it.get('url'):
                continue
            items.append({
                "headline": it.get("headline"),
                "url": it.get("url"),
                "source": it.get("source"),
                "time": (it.get("datetime") or 0) * 1000  # seconds → ms
            })

        # Optional: sort newest first
        items.sort(key=lambda x: x["time"], reverse=True)

        return jsonify({"items": items}), 200

    except requests.RequestException as e:
        # Network/timeout/etc.
        return jsonify({"items": [], "error": "request-failed"}), 200
    
    
# --- AI Chatbot Route ---
import os
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy import desc

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@main_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    messages = data.get("messages")

    # Minimal input handling
    if not messages:
        if not text:
            return jsonify({"error": "No input"}), 400
        messages = [{"role": "user", "content": text}]

    # OPTIONAL: tiny personalization using last 30 days of this user's expenses
    if "user_id" in session:
        from collections import defaultdict
        from datetime import date, timedelta

        cutoff = date.today() - timedelta(days=30)
        exps = Expense.query.filter(
            Expense.userID == session["user_id"],
            Expense.date >= cutoff
        ).all()

        total = 0.0
        by_cat = defaultdict(float)
        for e in exps:
            if (e.category or "").lower() != "income":
                total += float(e.amount or 0)
                by_cat[e.category] += float(e.amount or 0)

        top_cats = sorted(by_cat.items(), key=lambda kv: kv[1], reverse=True)[:3]
        top_str = ", ".join([f"{k}: ${v:,.0f}" for k, v in top_cats]) or "none"

        system = {
            "role": "system",
            "content": (
                "You are a concise educational finance assistant for a personal budgeting app. "
                "Use the user's recent spending context if provided. Be specific and practical. "
                "Avoid legal/tax advice. Currency is USD unless the user says otherwise.\n\n"
                f"Recent 30d spend (excl. income): ${total:,.0f}. Top categories: {top_str}."
            ),
        }
        messages = [system] + messages

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3,
        )
        reply = resp.choices[0].message.content
        return jsonify({"reply": reply})
    except Exception as e:
        print("Chat error:", e)
        return jsonify({"error": "Chat failed"}), 500
