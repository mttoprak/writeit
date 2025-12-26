import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Aside = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [recentSubs, setRecentSubs] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem("recentSubs");
        if (stored) {
            setRecentSubs(JSON.parse(stored));
        }
    }, []);

    const handleSubClick = (nameKey) => {
        navigate(`/app/w/${nameKey}`);
    };

    return (
        <aside className="aside" style={{ width: "270px", display: "flex", flexDirection: "column", gap: "15px" }}>

            {/* Create Community Button */}
            <div style={{ backgroundColor: "#1a1a1b", borderRadius: "4px", border: "1px solid #343536", padding: "12px" }}>
                <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "8px", color: "#d7dadc" }}>
                    Home
                </div>
                <div style={{ fontSize: "12px", marginBottom: "12px", color: "#d7dadc" }}>
                    Your personal WriteIt frontpage. Come here to check in with your favorite communities.
                </div>
                <button
                    onClick={() => navigate("/app/create-community")}
                    style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "20px",
                        border: "1px solid #d7dadc",
                        backgroundColor: "transparent",
                        color: "#d7dadc",
                        fontWeight: "bold",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#272729"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                    Create Community
                </button>
                <button
                    onClick={() => navigate("/app/new-post")}
                    style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "20px",
                        border: "none",
                        backgroundColor: "#d7dadc",
                        color: "#1a1a1b",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: "10px"
                    }}
                >
                    Create Post
                </button>
            </div>

            {/* Recently Visited */}
            {recentSubs.length > 0 && (
                <div style={{ backgroundColor: "#1a1a1b", borderRadius: "4px", border: "1px solid #343536" }}>
                    <div style={{ padding: "10px", fontSize: "10px", fontWeight: "bold", color: "#818384", textTransform: "uppercase" }}>
                        Recently Visited
                    </div>
                    {recentSubs.map((sub) => (
                        <div
                            key={sub.nameKey}
                            onClick={() => handleSubClick(sub.nameKey)}
                            style={{ display: "flex", alignItems: "center", padding: "8px 10px", cursor: "pointer", gap: "10px" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#272729"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                            {sub.iconImg ? (
                                <img src={sub.iconImg} alt="" style={{ width: "20px", height: "20px", borderRadius: "50%" }} />
                            ) : (
                                <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#272729", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", color: "#d7dadc" }}>
                                    {sub.nameKey[0].toUpperCase()}
                                </div>
                            )}
                            <span style={{ fontSize: "14px", color: "#d7dadc" }}>w/{sub.nameKey}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Joined Communities */}
            {currentUser && currentUser.joinedSubcommunities && currentUser.joinedSubcommunities.length > 0 && (
                <div style={{ backgroundColor: "#1a1a1b", borderRadius: "4px", border: "1px solid #343536" }}>
                    <div style={{ padding: "10px", fontSize: "10px", fontWeight: "bold", color: "#818384", textTransform: "uppercase" }}>
                        Your Communities
                    </div>
                    {currentUser.joinedSubcommunities.map((sub) => (
                        <div
                            key={sub._id}
                            onClick={() => handleSubClick(sub.nameKey)}
                            style={{ display: "flex", alignItems: "center", padding: "8px 10px", cursor: "pointer", gap: "10px" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#272729"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                            {sub.iconImg ? (
                                <img src={sub.iconImg} alt="" style={{ width: "20px", height: "20px", borderRadius: "50%" }} />
                            ) : (
                                <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#272729", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", color: "#d7dadc" }}>
                                    {sub.nameKey ? sub.nameKey[0].toUpperCase() : "?"}
                                </div>
                            )}
                            <span style={{ fontSize: "14px", color: "#d7dadc" }}>w/{sub.nameKey}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Links (Optional) */}
            <div style={{ padding: "10px", fontSize: "12px", color: "#818384" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    <span>User Agreement</span>
                    <span>Privacy Policy</span>
                </div>
                <div style={{ marginTop: "10px" }}>WriteIt © 2025. All rights reserved.</div>
            </div>

        </aside>
    );
};

export default Aside;