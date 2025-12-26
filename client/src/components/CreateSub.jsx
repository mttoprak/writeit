import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CreateSub() {
    // Hataları obje olarak tutuyoruz
    const [errors, setErrors] = useState({});
    // Backend'den gelen genel hatalar için
    const [generalError, setGeneralError] = useState(null);

    // YENİ: Yükleniyor ve Başarılı durumları
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();

    const [input, setInput] = useState({
        name: "",
        displayName: "",
        description: "",
        bannerImg: "",
        iconImg: "",
    });

    const handleChange = (e) => {
        // İşlem başarılıysa veya yükleniyorsa değişikliğe izin verme
        if (isSuccess || isLoading) return;

        setInput((prev) => ({ ...prev, [e.target.name]: e.target.value }));

        if (errors[e.target.name]) {
            setErrors((prev) => ({ ...prev, [e.target.name]: null }));
        }
        setGeneralError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setGeneralError(null);

        const newErrors = {};

        // --- VALIDASYONLAR ---
        if (input.name.length < 3) {
            newErrors.name = "Name (URL) must be at least 3 characters long.";
        } else if (input.name.length > 21) {
            newErrors.name = "Name (URL) cannot exceed 21 characters.";
        } else if (!/^[a-zA-Z0-9_]+$/.test(input.name)) {
            newErrors.name = "Only letters, numbers, and underscores allowed.";
        }

        if (input.displayName.length < 3) {
            newErrors.displayName = "Display Name must be at least 3 characters long.";
        } else if (input.displayName.length > 50) {
            newErrors.displayName = "Display Name cannot exceed 50 characters.";
        }

        if (input.description.length > 500) {
            newErrors.description = "Description cannot exceed 500 characters.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // YENİ: Yükleniyor durumunu başlat
        setIsLoading(true);

        try {
            const { name, ...rest } = input;
            const payload = {
                ...rest,
                nameKey: name
            };

            await api.post("/Subs/create", payload);

            // YENİ: Başarılı durumu
            setIsLoading(false);
            setIsSuccess(true);

            // YENİ: 2 saniye bekle ve yönlendir
            setTimeout(() => {
                navigate("/app");
            }, 2000);

        } catch (error) {
            console.error(error);
            setIsLoading(false); // Hata olursa loading'i kapat
            setGeneralError(error.response?.data?.error || "Bir hata oluştu.");
        }
    };

    const getInputStyle = (fieldName) => ({
        borderColor: errors[fieldName] ? "#ff6b6b" : "#343536",
        borderWidth: "1px",
        borderStyle: "solid",
        padding: "5px",
        width: "100%",
        borderRadius: "4px",
        backgroundColor: (isLoading || isSuccess) ? "#161617" : "#272729",
        color: "#d7dadc",
        cursor: (isLoading || isSuccess) ? "not-allowed" : "text",
        boxSizing: "border-box"
    });

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
                maxWidth: "600px",
                border: "1px solid #343536"
            }}>
                <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#d7dadc" }}>Create a Community</h1>

                {generalError && (
                    <div style={{
                        backgroundColor: "#3e1a1a",
                        color: "#ff6b6b",
                        padding: "10px",
                        borderRadius: "4px",
                        marginBottom: "15px",
                        textAlign: "center",
                        border: "1px solid #b71c1c"
                    }}>
                        {generalError}
                    </div>
                )}

                {isSuccess && (
                    <div style={{
                        backgroundColor: "#006400",
                        color: "white",
                        padding: "10px",
                        borderRadius: "4px",
                        marginBottom: "15px",
                        textAlign: "center"
                    }}>
                        Community created successfully! Redirecting...
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Name (URL) */}
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#d7dadc" }}>Name (URL)</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="e.g. technology"
                            value={input.name}
                            onChange={handleChange}
                            style={getInputStyle("name")}
                            disabled={isLoading || isSuccess}
                        />
                        {errors.name && <span style={{ color: "#ff6b6b", fontSize: "12px" }}>{errors.name}</span>}
                        <div style={{ fontSize: "12px", color: "#818384", marginTop: "2px" }}>
                            This will be used in the URL (e.g. writeit.app/w/technology)
                        </div>
                    </div>

                    {/* Display Name */}
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#d7dadc" }}>Display Name</label>
                        <input
                            type="text"
                            name="displayName"
                            placeholder="e.g. Technology News"
                            value={input.displayName}
                            onChange={handleChange}
                            style={getInputStyle("displayName")}
                            disabled={isLoading || isSuccess}
                        />
                        {errors.displayName && <span style={{ color: "#ff6b6b", fontSize: "12px" }}>{errors.displayName}</span>}
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#d7dadc" }}>Description</label>
                        <textarea
                            name="description"
                            placeholder="What is this community about?"
                            value={input.description}
                            onChange={handleChange}
                            rows="4"
                            style={{ ...getInputStyle("description"), resize: "vertical" }}
                            disabled={isLoading || isSuccess}
                        />
                        {errors.description && <span style={{ color: "#ff6b6b", fontSize: "12px" }}>{errors.description}</span>}
                    </div>

                    {/* Banner Image URL */}
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#d7dadc" }}>Banner Image URL (Optional)</label>
                        <input
                            type="text"
                            name="bannerImg"
                            placeholder="https://example.com/banner.png"
                            value={input.bannerImg}
                            onChange={handleChange}
                            style={getInputStyle("bannerImg")}
                            disabled={isLoading || isSuccess}
                        />
                    </div>

                    {/* Icon Image URL */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#d7dadc" }}>Icon Image URL (Optional)</label>
                        <input
                            type="text"
                            name="iconImg"
                            placeholder="https://example.com/icon.png"
                            value={input.iconImg}
                            onChange={handleChange}
                            style={getInputStyle("iconImg")}
                            disabled={isLoading || isSuccess}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || isSuccess}
                        style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: (isLoading || isSuccess) ? "#343536" : "#006400",
                            color: "white",
                            border: "none",
                            borderRadius: "20px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: (isLoading || isSuccess) ? "not-allowed" : "pointer",
                            transition: "background-color 0.2s"
                        }}
                    >
                        {isLoading ? "Creating..." : "Create Community"}
                    </button>
                </form>
            </div>
        </div>
    );
}
