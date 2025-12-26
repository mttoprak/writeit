import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div style={{ textAlign: "center", padding: "50px", color: "#d7dadc" }}>
            <h1 style={{ fontSize: "72px", margin: "0" }}>404</h1>
            <h2>Sayfa Bulunamadı</h2>
            <p>Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
            <br />
            <Link to="/app" style={{ fontSize: "18px", color: "#006400", textDecoration: "none", fontWeight: "bold" }}>
                &larr; Anasayfaya Dön
            </Link>
        </div>
    );
};

export default NotFound;