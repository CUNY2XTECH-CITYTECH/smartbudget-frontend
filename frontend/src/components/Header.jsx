import logo from "../pages/logo.png";  
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Header() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/session", { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (data.loggedIn) {
                    setLoggedIn(true);
                    setUsername(data.user);
                    console.log(data.message)
                } else {
                    setLoggedIn(false);
                    setUsername("");
                }
            });
    }, []);

    const handleLogout = async () => {
        await fetch("/logout", { method: "POST", credentials: "include" });
        setLoggedIn(false);
        setUsername("");
        navigate("/login");
    };

    return (
        <div>
            <header className="home-header">
                <div className="left-section">
                    <img src={logo} alt="SmartBudget Logo" className="logo" />
                    <span className="slogan">Your Money, Organized.</span>
                </div>
                <div className="auth-links">
                    {loggedIn ? (
                        <button className="btn btn-logout" onClick={handleLogout}>
                            Logout {username && <span>({username})</span>}
                        </button>
                    ) : (
                        <>
                            <Link to="/signup" className="btn btn-signup">Sign up</Link>
                            <Link to="/login" className="btn btn-login">Log in</Link>
                        </>
                    )}
                </div>
            </header>
        </div>
    )
}

export default Header;