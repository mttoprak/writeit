// client/src/components/LogoutButton.jsx
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const LogoutButton = ({ className }) => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);

    const handleLogout = async () => {
        if (loading) return;
        setLoading(true);
        setErr(null);

        try {
            await logout();
            navigate("/", { replace: true });
        } catch (e) {
            setErr("Logout failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className={className}
            >
                {loading ? "Logging out..." : "Logout"}
            </button>

            {err && <p>{err}</p>}
        </div>
    );
};

export default LogoutButton;
