from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)

app.secret_key = "your_super_secret_key"  # required for sessions
CORS(app, origins=["http://localhost:5173"],supports_credentials=True)

# Register blueprint from routes.py
app.register_blueprint(main_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5001)

from datetime import timedelta

app = Flask(__name__)
app.secret_key = "your_super_secret_key"

# Set cookie timeout
app.permanent_session_lifetime = timedelta(hours=24)  # expires in 30 minutes
app.config['SESSION_COOKIE_SAMESITE'] = "Lax"
app.config['SESSION_COOKIE_SECURE'] = False  # True in production with HTTPS

