// client/src/pages/Lander.jsx
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const HAS_AUTO_REDIRECTED_KEY = "hasAutoRedirectedToApp";

const Lander = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Kullanıcı login ise ama daha önce auto-redirect yapılmadıysa bir kere /app'e gönder
        const hasAutoRedirected =
            localStorage.getItem(HAS_AUTO_REDIRECTED_KEY) === "true";

        if (currentUser && !hasAutoRedirected) {
            localStorage.setItem(HAS_AUTO_REDIRECTED_KEY, "true");
            navigate("/login", { replace: true });
        }
    }, [currentUser, navigate]);

    return (

        <div>{/* landing içeriği */}</div>

    );
};

export default Lander;
