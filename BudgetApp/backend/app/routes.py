from flask import Blueprint, render_template, request, jsonify
from .models import Expense
from . import db
from sqlalchemy import not_
import pandas as pd
from collections import defaultdict
import json

main_bp = Blueprint('main', __name__)

@main_bp.route("/")
def home_page():
    return render_template('index.html')

#route to handle uploading files
@main_bp.route('/upload', methods=['POST'])
def upload_csv():
    #reads file submitted
    file = request.files['file']
    #ensures file is csv
    if not file or not file.filename.endswith('.csv'):
        return "Invalid file", 400


    df = pd.read_csv(file)          #turns file into pandas data frame
    records = df.to_dict(orient='records')          #turn pandas data frame into a dictionary to render into html to see data ***should remove this functionality, used for testing***

    #reads the rows of the data frame and and creates an object from Expense class and adds it to database
    for _,row in df.iterrows(): #only grab the headers not the index
        data_rows = Expense(description=row.get('description'),
        amount=float(row.get('amount', 0)),
        category=row.get('category'),
        date = pd.to_datetime(row.get('date')).date(),
        )
        
        db.session.add(data_rows)
    db.session.commit()


    expenses = Expense.query.all()  #get all rows from the expense table
    #turn into list of dictionaries to be sent to be rendered
    expense_dict =[ {
        'id': expense.id,
        'description': expense.description,
        'amount': expense.amount,
        'category': expense.category,
        'date': expense.date.strftime('%Y-%m-%d')  # format datetime to string
    } for expense in expenses]
    
    # Prepare data for Chart.js — e.g., group by category or date
    # Here, for example, group total amount by category
    data = {}
    for element in expenses:
        cat = element.category
        data[cat] = data.get(cat, 0) + (element.amount or 0)

    # Convert dict keys and values to lists (labels and data)
    labels = list(data.keys())
    amounts = list(data.values())
    # Pass it to the template



    #create dictionary with date:amount and sort them in terms of date and send to front end to line graph

    expense_filtered = Expense.query.filter(Expense.category != 'Income').all()     #filter out income only want expenses
    daily_totals = defaultdict(float)       #use default dictionary which automatically sets to 0 if no value for the key

    for e in expense_filtered:      #sum up all expense amounts per date
        if e.date:
            daily_totals[e.date.strftime('%Y-%m-%d')] += e.amount

    labels_filtered = sorted(daily_totals.keys())       #sort the dates in chronological order
    amounts_filtered = [daily_totals[date] for date in labels_filtered]      #get a list of corresponding amounts for sorted dates


    return render_template('index.html', records=expense_dict,labels=json.dumps(labels), amounts=json.dumps(amounts), labels_fil=json.dumps(labels_filtered), amounts_fil=json.dumps(amounts_filtered))

@main_bp.route('/view_expenses')
def view_expenses():
    expenses = Expense.query.all()
    return "<br>".join([f"{e.id} {e.description} {e.amount}" for e in expenses])

# Signup
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    password = data.get('password')

    # Check if user already exists
    existing_user = User.query.filter_by(name=name).first()
    if existing_user:
        return jsonify({"message": "Username already taken"}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(name=name, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201

# Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    name = data.get('name')
    password = data.get('password')

    user = User.query.filter_by(name=name).first()

    if user and check_password_hash(user.password, password):
        return jsonify({"message": "Login successful", "userID": user.userID}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401