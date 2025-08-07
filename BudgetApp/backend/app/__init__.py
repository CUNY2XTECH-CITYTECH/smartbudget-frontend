from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')

    # CORS
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    # Config
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///budget.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # INIT DB
    db.init_app(app)

    # ⬇️ Move model import AFTER db.init_app(app)
    from . import models

    # Register blueprint
    from .routes import main_bp
    app.register_blueprint(main_bp, url_prefix='/api')

    # Serve frontend
    @app.route('/')
    @app.route('/<path:path>')
    def serve_react(path=''):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    # Create DB tables
    with app.app_context():
        db.create_all()

    return app
