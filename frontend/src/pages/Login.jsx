import { useState } from "react";
import { loginUser } from "../services/api";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            const data = await loginUser(email, password);

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            onLogin();
            setMessage(`Welcome, ${data.user.name}`);
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className="login-page light-mode">
            <div className="login-card glass-panel">
                <h1>CyberIncident</h1>
                <p>Cybersecurity Incident Management System</p>

                <form onSubmit={handleLogin}>
                    <input
                        className="cyber-input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <div className="password-input-wrapper">
                        <input
                            className="cyber-input"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                        <button 
                            type="button" 
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? "👁️‍🗨️" : "👁️"}
                        </button>
                    </div>

                    <button className="cyber-button primary" type="submit">Login</button>
                </form>

                {message && <p className="login-message">{message}</p>}
            </div>
        </div>
    );
}

export default Login;