// client/src/components/CreatePost.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";

export default function CreatePost() {

    // Hataları obje olarak tutuyoruz
    const [errors, setErrors] = useState({});
    // Backend'den gelen genel hatalar için
    const [generalError, setGeneralError] = useState(null);

    // Yükleniyor ve Başarılı durumları
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();

    const [input, setInput] = useState({
        title: "",
        content: "",
        img: "",
        subcommunityName: "", // Kullanıcı buraya topluluk adını yazacak (örn: yazilim)
    });

    const handleChange = (e) => {
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
        if (!input.subcommunityName || input.subcommunityName.trim() === "") {
            newErrors.subcommunityName = "Please specify a community to post in.";
        }

        if (input.title.length < 3) {
            newErrors.title = "Title must be at least 3 characters.";
        } else if (input.title.length > 150) {
            newErrors.title = "Title cannot exceed 150 characters.";
        }

        if (input.content.length > 20000) {
            // DÜZELTME: Burası displayName kalmış, content olmalıydı.
            newErrors.content = "Content cannot exceed 20.000 characters.";
        }

        if (!input.content || input.content.trim() === "") {
            newErrors.content = "Content is required.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            await api.post("/posts/create", input);

            setIsLoading(false);
            setIsSuccess(true);

            setTimeout(() => {
                navigate("/app");
            }, 2000);

        } catch (error) {
            console.error(error);
            setIsLoading(false);
            setGeneralError(error.response?.data?.error || "Bir hata oluştu.");
        }
    };

    // Input stili için yardımcı fonksiyon
    const getInputStyle = (fieldName) => ({
        borderColor: errors[fieldName] ? "#ff6b6b" : "#343536",
        borderWidth: "1px",
        borderStyle: "solid",
        padding: "10px",
        width: "100%",
        borderRadius: "4px",
        backgroundColor: (isLoading || isSuccess) ? "#161617" : "#272729",
        color: "#d7dadc",
        cursor: (isLoading || isSuccess) ? "not-allowed" : "text",
        boxSizing: "border-box" // Padding taşmasını önler
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
                <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#d7dadc" }}>Create a Post</h1>

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
                        Post created successfully! Redirecting...
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Subcommunity Name */}
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#d7dadc" }}>
                            Community Name (e.g. technology)
                        </label>
                        <input
                            type="text"
                            name="subcommunityName"
                            placeholder="technology"
                            value={input.subcommunityName}
                            onChange={handleChange}
                            style={getInputStyle("subcommunityName")}
                            disabled={isLoading || isSuccess}
                        />
                        {errors.subcommunityName && <span style={{ color: "#ff6b6b", fontSize: "12px" }}>{errors.subcommunityName}</span>}
                    </div>

                    {/* Title */}
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#d7dadc" }}>Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="An interesting title"
                            value={input.title}
                            onChange={handleChange}
                            style={getInputStyle("title")}
                            disabled={isLoading || isSuccess}
                        />
                        {errors.title && <span style={{ color: "#ff6b6b", fontSize: "12px" }}>{errors.title}</span>}
                    </div>

                    {/* Image URL (Optional) */}
                    <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#d7dadc" }}>Image URL (Optional)</label>
                        <input
                            type="text"
                            name="img"
                            placeholder="https://example.com/image.png"
                            value={input.img}
                            onChange={handleChange}
                            style={getInputStyle("img")}
                            disabled={isLoading || isSuccess}
                        />
                    </div>

                    {/* Content */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#d7dadc" }}>Content</label>
                        <textarea
                            name="content"
                            placeholder="Text (optional)"
                            value={input.content}
                            onChange={handleChange}
                            rows="6"
                            style={{ ...getInputStyle("content"), resize: "vertical" }}
                            disabled={isLoading || isSuccess}
                        />
                        {errors.content && <span style={{ color: "#ff6b6b", fontSize: "12px" }}>{errors.content}</span>}
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
                        {isLoading ? "Posting..." : "Post"}
                    </button>
                </form>
            </div>
        </div>
    );
}
