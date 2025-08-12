# models.py
from . import db
from datetime import datetime, date

# --------------------- User ---------------------
class User(db.Model):
    __tablename__ = 'users'
    userID   = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

    # optional backrefs
    expenses = db.relationship('Expense', backref='user', lazy=True, cascade='all, delete-orphan')
    threads  = db.relationship('Thread',  backref='author', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='author', lazy=True, cascade='all, delete-orphan')

# --------------------- Expense ---------------------
class Expense(db.Model):
    __tablename__ = 'expenses'
    id          = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200))
    amount      = db.Column(db.Float)
    category    = db.Column(db.String(100))
    date        = db.Column(db.Date)
    userID      = db.Column(db.Integer, db.ForeignKey('users.userID'), nullable=False)

# --------------------- Transaction ---------------------
class Transaction(db.Model):
    __tablename__ = 'transactions'
    transactionID = db.Column(db.Integer, primary_key=True)
    userID        = db.Column(db.Integer, db.ForeignKey('users.userID'))
    type          = db.Column(db.String(10))  # 'income' or 'expense'
    category      = db.Column(db.String(50))
    amount        = db.Column(db.Float)
    date          = db.Column(db.Date)

# --------------------- Budget ---------------------
class Budget(db.Model):
    __tablename__ = 'budgets'
    budgetID = db.Column(db.Integer, primary_key=True)
    userID   = db.Column(db.Integer, db.ForeignKey('users.userID'))
    category = db.Column(db.String(50))
    limitAmount = db.Column(db.Float)

# --------------------- Stock ---------------------
class Stock(db.Model):
    __tablename__ = 'stocks'
    stockID     = db.Column(db.Integer, primary_key=True)
    symbol      = db.Column(db.String(10))
    companyName = db.Column(db.String(100))
    currentPrice= db.Column(db.Float)
    lastUpdated = db.Column(db.Date)

# --------------------- Thread ---------------------
class Thread(db.Model):
    __tablename__ = 'threads'
    threadID = db.Column(db.Integer, primary_key=True)
    userID   = db.Column(db.Integer, db.ForeignKey('users.userID', ondelete='CASCADE'), nullable=False)
    title    = db.Column(db.String(200), nullable=False)
    content  = db.Column(db.Text, nullable=False)
    timestamp= db.Column(db.DateTime, default=datetime.utcnow)
    comments = db.relationship('Comment', backref='thread', lazy=True, cascade='all, delete-orphan')

# --------------------- Comment ---------------------
class Comment(db.Model):
    __tablename__ = 'comments'
    commentID = db.Column(db.Integer, primary_key=True)
    threadID  = db.Column(db.Integer, db.ForeignKey('threads.threadID', ondelete='CASCADE'), nullable=False)
    userID    = db.Column(db.Integer, db.ForeignKey('users.userID',   ondelete='CASCADE'), nullable=False)
    content   = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
