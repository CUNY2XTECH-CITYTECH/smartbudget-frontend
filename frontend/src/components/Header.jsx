import logo from "../assets/logo.png"
import { Link } from "react-router-dom";

function Header() {
    return (
        <div>
            <header className="home-header">
                <div className="left-section">
                    <img src={logo} alt="SmartBudget Logo" className="logo" />
                    <span className="slogan">Your Money, Organized.</span>
                </div>
                <div className="auth-links">
                    <Link to="/signup" className="btn btn-signup">Sign up</Link>
                    <Link to="/login" className="btn btn-login">Log in</Link>
                </div>
            </header>
        </div>
    )
}

export default Header