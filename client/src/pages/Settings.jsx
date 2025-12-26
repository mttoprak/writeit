import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { updateUser } from "../services/api";

export default function Settings() {
    const { currentUser, updateCurrentUser } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        displayName: currentUser?.displayName || "",
        about: currentUser?.about || "",
        email: currentUser?.email || "",
        profilePic: currentUser?.profilePic || ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const updatedUser = await updateUser(formData);
            updateCurrentUser(updatedUser);
            setMessage("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "20px auto", padding: "20px", backgroundColor: "#1a1a1b", borderRadius: "4px", border: "1px solid #343536" }}>
            <h2 style={{ marginBottom: "20px", borderBottom: "1px solid #343536", paddingBottom: "10px", color: "#d7dadc" }}>User Settings</h2>

            {message && <div style={{ padding: "10px", backgroundColor: "#006400", color: "white", borderRadius: "4px", marginBottom: "15px" }}>{message}</div>}
            {error && <div style={{ padding: "10px", backgroundColor: "#3e1a1a", color: "#ff6b6b", borderRadius: "4px", marginBottom: "15px", border: "1px solid #b71c1c" }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px", color: "#d7dadc" }}>Display Name</label>
                    <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        maxLength="30"
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #343536", backgroundColor: "#272729", color: "#d7dadc" }}
                    />
                    <div style={{ fontSize: "12px", color: "#818384", marginTop: "2px" }}>Max 30 characters</div>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px", color: "#d7dadc" }}>About (Description)</label>
                    <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleChange}
                        rows="4"
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #343536", resize: "vertical", backgroundColor: "#272729", color: "#d7dadc" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px", color: "#d7dadc" }}>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #343536", backgroundColor: "#272729", color: "#d7dadc" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", fontSize: "14px", color: "#d7dadc" }}>Profile Picture URL</label>
                    <input
                        type="text"
                        name="profilePic"
                        value={formData.profilePic}
                        onChange={handleChange}
                        placeholder="https://example.com/image.png"
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #343536", backgroundColor: "#272729", color: "#d7dadc" }}
                    />
                </div>

                <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end" }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: "8px 20px",
                            borderRadius: "20px",
                            border: "none",
                            backgroundColor: "#006400",
                            color: "white",
                            fontWeight: "bold",
                            cursor: loading ? "default" : "pointer",
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
