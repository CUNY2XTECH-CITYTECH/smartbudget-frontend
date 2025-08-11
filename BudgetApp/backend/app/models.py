
from . import db
from datetime import date, datetime


#structure your data base when reading from csv file
class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200))
    amount = db.Column(db.Float)
    category = db.Column(db.String(100))
    date = db.Column(db.Date)
    #user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class User(db.Model):
    __tablename__ = 'users'

    userID = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)

    # Relationships
    threads = db.relationship('Thread', backref='author', lazy=True)
    comments = db.relationship('Comment', backref='author', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'
    
# 2. Transactions Table
class Transaction(db.Model):
    __tablename__ = 'transactions'
    transactionID = db.Column(db.Integer, primary_key=True)
    userID = db.Column(db.Integer, db.ForeignKey('users.userID'))
    type = db.Column(db.String(10))  # 'income' or 'expense'
    category = db.Column(db.String(50))
    amount = db.Column(db.Float)
    date = db.Column(db.Date)# 3. Budgets Table
class Budget(db.Model):
    __tablename__ = 'budgets'
    budgetID = db.Column(db.Integer, primary_key=True)
    userID = db.Column(db.Integer, db.ForeignKey('users.userID'))
    category = db.Column(db.String(50))
    limitAmount = db.Column(db.Float)# 4. Stocks Table
class Stock(db.Model):
    __tablename__ = 'stocks'
    stockID = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10))
    companyName = db.Column(db.String(100))
    currentPrice = db.Column(db.Float)
    lastUpdated = db.Column(db.Date)

    #5. Thread
class Thread(db.Model):
    __tablename__ = 'threads'

    threadID = db.Column(db.Integer, primary_key=True)
    userID = db.Column(db.Integer, db.ForeignKey('users.userID'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # One-to-many: one thread has many comments
    comments = db.relationship('Comment', backref='thread', lazy=True, cascade='all, delete')

    def __repr__(self):
        return f'<Thread {self.title}>'

# ---------------------
# Comment Model
# ---------------------
class Comment(db.Model):
    __tablename__ = 'comments'

    commentID = db.Column(db.Integer, primary_key=True)
    threadID = db.Column(db.Integer, db.ForeignKey('threads.threadID'), nullable=False)
    userID = db.Column(db.Integer, db.ForeignKey('users.userID'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Comment by User {self.userID} on Thread {self.threadID}>'


