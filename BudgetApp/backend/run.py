from flask import Flask
from app.routes import main_bp  # <-- adjust if your folder isn't a package
from datetime import timedelta
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "your_super_secret_key"  # required for sessions
CORS(app, origins=["https://localhost:5173"],supports_credentials=True)

# Register blueprint from routes.py
app.register_blueprint(main_bp)

if __name__ == "__main__":
    app.run(debug=True)

from datetime import timedelta

app = Flask(__name__)
app.secret_key = "your_super_secret_key"

# Set cookie timeout
app.permanent_session_lifetime = timedelta(hours=24)  # expires in 30 minutes
app.config['SESSION_COOKIE_SAMESITE'] = "Lax"
app.config['SESSION_COOKIE_SECURE'] = False  # True in production with HTTPS
