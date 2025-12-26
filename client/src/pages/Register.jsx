import {useContext, useState} from "react";
import {AuthContext} from "../context/AuthContext";
import {useNavigate} from "react-router-dom";

export default function Register() {

    const { register } = useContext(AuthContext);
    const [err, setErr] = useState(null);
    const navigate = useNavigate();

    const [input, setInput] = useState({
        username: "",
        displayName: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setInput((prev) => ({...prev, [e.target.name]: e.target.value}));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr(null);

        const dataToSend = { ...input };
        if (!dataToSend.displayName || dataToSend.displayName.trim() === "") {
            delete dataToSend.displayName;
        }

        try{
            await register(dataToSend);
            navigate("/");
        } catch (err){
            if (err.response && err.response.data && err.response.data.error) {
                setErr(err.response.data.error);
            } else {
                // Fallback for network errors
                setErr(err.message || "Registration failed");
            }
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
                <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#d7dadc" }}>Register</h1>
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
                        <label style={{ color: "#d7dadc", fontWeight: "bold" }}>Display Name (Optional):</label>
                        <input
                            name="displayName"
                            type="text"
                            value={input.displayName}
                            onChange={handleChange}
                            placeholder="Leave blank to use username"
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
                        <label style={{ color: "#d7dadc", fontWeight: "bold" }}>Email:</label>
                        <input
                            name="email"
                            type="email"
                            value={input.email}
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
                        Register!
                    </button>

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

                </form>

                <div style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#818384" }}>
                    Already have an account? <span onClick={() => navigate("/login")} style={{ color: "#d7dadc", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}>Log In</span>
                </div>
            </div>
        </div>
    );
}