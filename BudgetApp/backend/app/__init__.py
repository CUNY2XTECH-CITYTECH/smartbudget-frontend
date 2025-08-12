# app/__init__.py
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import timedelta
import os
from dotenv import load_dotenv

db = SQLAlchemy()

def create_app():
    load_dotenv()

    app = Flask(
        __name__,
        static_folder='../frontend/dist',   # adjust if your build path differs
        static_url_path=''
    )

    # --- Core config (sessions & security) ---
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-please-change-me')
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=4)
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'    # use 'None' + Secure=True when you move to HTTPS
    app.config['SESSION_COOKIE_SECURE']  = False

    # --- Third-party API keys (one place only) ---
    app.config['FINNHUB_API_KEY'] = os.environ.get('FINNHUB_API_KEY', '')

    # --- Database ---
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///budget.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # --- CORS ---
    # Allow credentials for session cookie, restrict to your dev origin
    CORS(app,
         origins=["http://localhost:5173"],
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"])

    # Init DB, import models AFTER init
    db.init_app(app)
    from . import models  # noqa: F401

    # Blueprints
    from .routes import main_bp
    app.register_blueprint(main_bp, url_prefix='/api')

    # Serve React build
    @app.route('/')
    @app.route('/<path:path>')
    def serve_react(path=''):
        # If the file exists inside the built frontend, serve it; otherwise index.html
        full = os.path.join(app.static_folder, path)
        if path and os.path.exists(full):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')

    # Create tables once
    with app.app_context():
        db.create_all()

    return app
