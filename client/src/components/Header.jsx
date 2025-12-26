// client/src/components/Header.jsx
import { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

const Header = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header style={{
            padding: "10px 20px",
            backgroundColor: "#1a1a1b", // Dark header
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #343536", // Dark border
            position: "sticky",
            top: 0,
            zIndex: 1000,
            color: "#d7dadc"
        }}>
            {/* Sol Taraf: Logo / Başlık */}
            <Link to={currentUser ? "/app" : "/"} style={{ textDecoration: "none", color: "#d7dadc", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", backgroundColor: "#006400", borderRadius: "50%" }}></div>
                <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>writeit</h1>
            </Link>

            {/* Sağ Taraf: Butonlar ve Profil */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {!currentUser ? (
                    <>
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            style={{
                                padding: "6px 20px",
                                borderRadius: "20px",
                                border: "1px solid #006400",
                                backgroundColor: "transparent",
                                color: "#006400",
                                fontWeight: "bold",
                                cursor: "pointer"
                            }}
                        >
                            Log In
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            style={{
                                padding: "6px 20px",
                                borderRadius: "20px",
                                border: "none",
                                backgroundColor: "#006400",
                                color: "white",
                                fontWeight: "bold",
                                cursor: "pointer"
                            }}
                        >
                            Sign Up
                        </button>
                    </>
                ) : (
                    <div style={{ position: "relative" }} ref={dropdownRef}>
                        {/* KULLANICI PROFİL İKONU (Dropdown Trigger) */}
                        <div
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "5px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                border: "1px solid transparent",
                                transition: "border 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.border = "1px solid #343536"}
                            onMouseLeave={(e) => !dropdownOpen && (e.currentTarget.style.border = "1px solid transparent")}
                        >
                            <div style={{
                                width: "30px",
                                height: "30px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                backgroundColor: "#006400", // Green profile bg
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "bold",
                                fontSize: "14px",
                            }}>
                                {currentUser.profilePic ? (
                                    <img
                                        src={currentUser.profilePic}
                                        alt={currentUser.username}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <span>{currentUser.username.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", fontSize: "12px", lineHeight: "1.2" }}>
                                <span style={{ fontWeight: "bold", color: "#d7dadc" }}>{currentUser.displayName}</span>
                                <span style={{ color: "#818384" }}>u/{currentUser.username}</span>
                            </div>
                            <span style={{ fontSize: "10px", color: "#818384" }}>▼</span>
                        </div>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div style={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                                width: "200px",
                                backgroundColor: "#1a1a1b", // Dark dropdown
                                border: "1px solid #343536",
                                borderRadius: "4px",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
                                zIndex: 1001,
                                marginTop: "5px"
                            }}>
                                <div style={{ padding: "10px", borderBottom: "1px solid #343536", color: "#818384", fontSize: "12px", fontWeight: "bold" }}>
                                    MY STUFF
                                </div>
                                <div
                                    onClick={() => { navigate(`/app/u/${currentUser.username}`); setDropdownOpen(false); }}
                                    style={{ padding: "10px 15px", cursor: "pointer", fontSize: "14px", color: "#d7dadc", display: "flex", alignItems: "center", gap: "10px" }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#272729"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                    👤 Profile
                                </div>
                                <div
                                    onClick={() => { navigate("/app/settings"); setDropdownOpen(false); }}
                                    style={{ padding: "10px 15px", cursor: "pointer", fontSize: "14px", color: "#d7dadc", display: "flex", alignItems: "center", gap: "10px" }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#272729"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                    ⚙️ User Settings
                                </div>
                                <div style={{ borderTop: "1px solid #343536", margin: "5px 0" }}></div>
                                <div
                                    onClick={handleLogout}
                                    style={{ padding: "10px 15px", cursor: "pointer", fontSize: "14px", color: "#d7dadc", display: "flex", alignItems: "center", gap: "10px" }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#272729"}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                    🚪 Log Out
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
