// client/src/pages/Login.jsx
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { login } = useContext(AuthContext);
    const [err, setErr] = useState(null);
    const navigate = useNavigate();

    const [input, setInput] = useState({
        username: "",
        password: ""
    });

    const handleChange = (e) => {
        setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        // Kullanıcı tekrar yazmaya başladığında hatayı temizle
        if (err) setErr(null);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr(null);
        try {
            await login(input);
            // Başarılı giriş sonrası /app (Feed) sayfasına yönlendir
            navigate("/app");
        } catch (err) {
            // Backend'den gelen hata mesajını yakala
            setErr(err.response?.data?.error || "Login failed");
        }
    }

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#030303", // Dark background
            padding: "20px"
        }}>
            <div style={{
                backgroundColor: "#1a1a1b", // Dark card
                padding: "40px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                width: "100%",
                maxWidth: "400px",
                border: "1px solid #343536"
            }}>
                <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#d7dadc" }}>Login</h1>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label style={{ color: "#d7dadc", fontWeight: "bold" }}>Username:</label>
                        <input
                            name="username"
                            type="text"
                            value={input.username}
                            onChange={handleChange}
                            style={{
                                padding: "10px",
                                fontSize: "16px",
                                borderRadius: "4px",
                                border: "1px solid #343536",
                                backgroundColor: "#272729",
                                color: "#d7dadc"
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label style={{ color: "#d7dadc", fontWeight: "bold" }}>Password:</label>
                        <input
                            name="password"
                            type="password"
                            value={input.password}
                            onChange={handleChange}
                            style={{
                                padding: "10px",
                                fontSize: "16px",
                                borderRadius: "4px",
                                border: "1px solid #343536",
                                backgroundColor: "#272729",
                                color: "#d7dadc"
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            padding: "12px",
                            fontSize: "16px",
                            backgroundColor: "#006400",
                            color: "white",
                            border: "none",
                            borderRadius: "20px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            marginTop: "10px"
                        }}
                    >
                        Login!
                    </button>
                </form>

                {err && (
                    <div style={{
                        marginTop: "20px",
                        padding: "10px",
                        color: "#ff6b6b",
                        backgroundColor: "#3e1a1a",
                        border: "1px solid #b71c1c",
                        borderRadius: "4px",
                        textAlign: "center"
                    }}>
                        {err}
                    </div>
                )}

                <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#818384" }}>
                    New to WriteIt? <span onClick={() => navigate("/register")} style={{ color: "#d7dadc", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}>Sign Up</span>
                </div>
            </div>
        </div>
    );
}
