from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from flask import send_from_directory

db = SQLAlchemy()

def create_app():
    app = Flask(
        __name__ , static_folder='../frontend/dist',static_url_path='')
    CORS(app, origins=["https://localhost:5173"],supports_credentials=True)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///budget.db'
    db.init_app(app)
    print("Flask template_folder is set to:", app.template_folder)

    from .routes import main_bp
    app.register_blueprint(main_bp)
    @app.route('/')
    @app.route('/<path:path>')
    def serve_react(path=''):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    with app.app_context():
        db.create_all()

    return app
