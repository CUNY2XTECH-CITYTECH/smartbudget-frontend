from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from .models import User, Expense, Transaction, Budget, Stock, Thread, Comment
from . import db
from sqlalchemy import not_
import pandas as pd
from collections import defaultdict
import os
from flask import send_from_directory

main_bp = Blueprint('main', __name__)

# -------------------- Health Check --------------------
# @main_bp.route("/")
# def health_check():
#     return jsonify({"message": "API running"}), 200

# -------------------- Signup --------------------
@main_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    password = data.get('password')

    if not name or not password:
        return jsonify({"message": "Missing username or password"}), 400

    if User.query.filter_by(name=name).first():
        return jsonify({"message": "Username already taken"}), 400

    hashed_pw = generate_password_hash(password)
    new_user = User(name=name, password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

# -------------------- Login --------------------
@main_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    name = data.get('name')
    password = data.get('password')

    user = User.query.filter_by(name=name).first()

    if user and check_password_hash(user.password, password):
        session.permanent = True  # ⬅️ this makes session use the configured timeout
        session['user_id'] = user.userID
        session['username'] = user.name
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

@main_bp.route('/threads', methods=['POST'])
def create_thread():
    if 'user_id' not in session:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    title = data.get("title")
    content = data.get("content")

    if not title or not content:
        return jsonify({"message": "Title and content are required"}), 400

    thread = Thread(
        userID=session['user_id'],
        title=title,
        content=content
    )
    db.session.add(thread)
    db.session.commit()

    return jsonify({
        "message": "Thread created",
        "threadID": thread.threadID
    }), 201


# GET route to retrieve all threads
@main_bp.route('/threads', methods=['GET'])
def get_threads():
    threads = Thread.query.all()

    return jsonify([
        {
            "threadID": t.threadID,
            "title": t.title,
            "content": t.content,
            "userID": t.userID,
            "timestamp": t.timestamp.isoformat()
        }
        for t in threads
    ])

 
@main_bp.route('/threads/<int:thread_id>/comment', methods=['POST'])
def add_comment(thread_id):
    if 'user_id' not in session:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    content = data.get("content")

    if not content:
        return jsonify({"message": "Content is required"}), 400

    comment = Comment(
        threadID=thread_id,
        userID=session['user_id'],
        content=content
    )
    db.session.add(comment)
    db.session.commit()

    return jsonify({
        "message": "Comment added",
        "commentID": comment.commentID
    }), 201

@main_bp.route('/threads/<int:thread_id>', methods=['GET'])
def get_thread_with_comments(thread_id):
    thread = Thread.query.get_or_4004(thread_id)
    comments = Comment.query.filter_by(threadID=thread_id).order_by(Comment.timestamp.asc()).all()

    return jsonify({
        "thread": {
            "threadID": thread.threadID, 
            "title": thread.title,
            "content": thread.content,
            "userID": thread.userID,
            "timestamp": thread.timestamp.isoformat()
        
        },
        "comments": [
            {
             "commentID": c.commentID,
             "userID": c.userID,
             "content": c.content,
            "timestamp": c.timestamp.isoformat()

            } for c in comments
        ]

    })






