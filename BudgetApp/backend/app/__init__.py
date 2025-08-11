from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import timedelta
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')

    # 🔑 Session secret key
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-please-change-me')
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=4)
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'   # or 'None' with HTTPS
    app.config['SESSION_COOKIE_SECURE'] = False     # set True in production

    # 🗄 Database config — MUST be set before db.init_app(app)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///budget.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Enable CORS
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    # Init DB
    db.init_app(app)

    # Import models after db is initialized
    from . import models

    # Register blueprints
    from .routes import main_bp
    app.register_blueprint(main_bp, url_prefix='/api')

    # Serve React build
    @app.route('/')
    @app.route('/<path:path>')
    def serve_react(path=''):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    # Create DB tables if not exist
    with app.app_context():
        db.create_all()

    return app
