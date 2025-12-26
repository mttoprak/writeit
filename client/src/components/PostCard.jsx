import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { votePost, savePost } from "../services/api";

export default function PostCard({ post }) {
    const navigate = useNavigate();
    const { currentUser, updateCurrentUser } = useContext(AuthContext);

    // --- OY SAYISI HESAPLAMA ---
    const [voteCount, setVoteCount] = useState(0);
    const [userVoteStatus, setUserVoteStatus] = useState(0);

    // Save state
    const isSaved = currentUser?.savedPosts?.includes(post._id);

    useEffect(() => {
        // Feed endpoint'i 'voteCount' dönerken, User endpoint'i 'upvotes' ve 'downvotes' array'leri döner.
        const count = post.voteCount !== undefined
            ? post.voteCount
            : (post.upvotes?.length || 0) - (post.downvotes?.length || 0);
        setVoteCount(count);

        // --- KULLANICI OY DURUMU ---
        let status = post.userVoteStatus;
        if (status === undefined && currentUser && post.upvotes && post.downvotes) {
            if (post.upvotes.includes(currentUser._id)) status = 1;
            else if (post.downvotes.includes(currentUser._id)) status = -1;
            else status = 0;
        }
        setUserVoteStatus(status || 0);
    }, [post, currentUser]);

    const handleVote = async (e, type) => {
        e.stopPropagation();
        if (!currentUser) {
            navigate("/login");
            return;
        }

        // Optimistic UI update
        const previousVoteStatus = userVoteStatus;
        const previousVoteCount = voteCount;

        let newVoteStatus = type;
        if (previousVoteStatus === type) {
            newVoteStatus = 0; // Toggle off
        }

        // Calculate new vote count
        let diff = 0;
        if (previousVoteStatus === 1) diff -= 1;
        if (previousVoteStatus === -1) diff += 1;
        if (newVoteStatus === 1) diff += 1;
        if (newVoteStatus === -1) diff -= 1;

        setUserVoteStatus(newVoteStatus);
        setVoteCount(previousVoteCount + diff);

        try {
            const res = await votePost(post._id, type);
            setVoteCount(res.voteCount);
            setUserVoteStatus(res.userVoteStatus);
        } catch (err) {
            console.error("Vote failed", err);
            setUserVoteStatus(previousVoteStatus);
            setVoteCount(previousVoteCount);
        }
    };

    const handleSave = async (e) => {
        e.stopPropagation();
        if (!currentUser) {
            navigate("/login");
            return;
        }
        try {
            const res = await savePost(post._id);
            updateCurrentUser({ savedPosts: res.savedPosts });
        } catch (err) {
            console.error("Save failed", err);
        }
    };

    const handleShare = (e) => {
        e.stopPropagation();
        const url = `${window.location.origin}/app/w/${post.subcommunityId?.nameKey}/${post._id}`;
        navigator.clipboard.writeText(url).then(() => {
            alert("Link copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy: ", err);
        });
    };

    // Tarih formatlama
    const dateStr = new Date(post.createdAt).toLocaleDateString();

    // Yönlendirme Fonksiyonları
    const handlePostClick = () => {
        navigate(`/app/w/${post.subcommunityId?.nameKey}/${post._id}`);
    };

    const handleSubClick = (e) => {
        e.stopPropagation();
        navigate(`/app/w/${post.subcommunityId?.nameKey}`);
    };

    const handleUserClick = (e) => {
        e.stopPropagation();
        navigate(`/app/u/${post.userId?.username}`);
    };

    return (
        <div
            onClick={handlePostClick}
            style={{
                display: "flex",
                backgroundColor: "#1a1a1b", // Dark background
                border: "1px solid #343536", // Dark border
                borderRadius: "4px",
                cursor: "pointer",
                overflow: "hidden",
                transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "#818384"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = "#343536"}
        >
            {/* SOL: Vote Bar */}
            <div style={{
                width: "40px",
                backgroundColor: "#161617", // Slightly darker than post bg
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "8px 0",
                borderRight: "1px solid #343536"
            }}>
                <button
                    onClick={(e) => handleVote(e, 1)}
                    style={{ border: "none", background: "none", cursor: "pointer", fontSize: "18px", color: userVoteStatus === 1 ? "#006400" : "#818384" }}
                >
                    ⬆
                </button>
                <span style={{ fontSize: "12px", fontWeight: "bold", margin: "5px 0", color: userVoteStatus === 1 ? "#006400" : (userVoteStatus === -1 ? "#7193ff" : "#d7dadc") }}>
                    {voteCount}
                </span>
                <button
                    onClick={(e) => handleVote(e, -1)}
                    style={{ border: "none", background: "none", cursor: "pointer", fontSize: "18px", color: userVoteStatus === -1 ? "#7193ff" : "#818384" }}
                >
                    ⬇
                </button>

                {/* Debug amaçlı vote status gösterimi (İsteğe bağlı) */}
                {/* <span style={{color: "green", fontSize: "10px"}} > {currentUser && userVoteStatus} </span> */}
            </div>

            {/* SAĞ: İçerik */}
            <div style={{ padding: "10px", flex: 1 }}>
                {/* Header: Subcommunity & User */}
                <div style={{ fontSize: "12px", color: "#818384", marginBottom: "8px", display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                    {post.subcommunityId?.iconImg && (
                        <img
                            src={post.subcommunityId.iconImg}
                            alt="icon"
                            style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }}
                        />
                    )}
                    <span
                        onClick={handleSubClick}
                        style={{ fontWeight: "bold", color: "#d7dadc", cursor: "pointer" }}
                        onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                        onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                    >
                        w/{post.subcommunityId?.nameKey}
                    </span>
                    <span>•</span>
                    <span
                        onClick={handleUserClick}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                        onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                    >
                        Posted by u/{post.userId?.username}
                    </span>
                    <span>•</span>
                    <span>{dateStr}</span>
                </div>

                {/* Title */}
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px", color: "#d7dadc", fontWeight: "500" }}>{post.title}</h3>

                {/* Image Preview (Varsa) */}
                {post.img && (
                    <div style={{ marginBottom: "10px", maxHeight: "400px", overflow: "hidden", borderRadius: "4px", display: "flex", justifyContent: "center", backgroundColor: "#030303" }}>
                        <img
                            src={post.img}
                            alt={post.title}
                            style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }}
                        />
                    </div>
                )}

                {/* Content Preview (Truncated) */}
                <div style={{ fontSize: "14px", color: "#d7dadc", marginBottom: "10px", lineHeight: "1.5" }}>
                    {post.content}
                </div>

                {/* Footer: Actions */}
                <div style={{ display: "flex", gap: "15px", fontSize: "12px", fontWeight: "bold", color: "#818384" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px", borderRadius: "2px" }}>
                        <span>💬</span> {post.commentIDs?.length || 0} Comments
                    </div>
                    <div onClick={handleShare} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px", cursor: "pointer" }}>
                        <span>↪️</span> Share
                    </div>
                    <div onClick={handleSave} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px", cursor: "pointer", color: isSaved ? "#006400" : "inherit" }}>
                        <span>{isSaved ? "🔖 Saved" : "🔖 Save"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
