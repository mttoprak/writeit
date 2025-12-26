import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api, { votePost, getComments, createComment, savePost } from "../services/api";
import LoadingAnimation from "../components/LoadingAnimation.jsx";
import { AuthContext } from "../context/AuthContext";
import CommentCard from "../components/CommentCard";

export default function PostDetail() {
    const { postId, subName } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, updateCurrentUser } = useContext(AuthContext);

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Vote states
    const [voteCount, setVoteCount] = useState(0);
    const [userVoteStatus, setUserVoteStatus] = useState(0);

    // Comment states
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [commentLoading, setCommentLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Save state
    const isSaved = currentUser?.savedPosts?.includes(postId);

    const fetchPostAndComments = async () => {
        try {
            setLoading(true);
            // Backend'den postu çek (populate edilmiş userId ve subcommunityId ile)
            const res = await api.get(`/posts/get/${postId}`);
            const fetchedPost = res.data;
            setPost(fetchedPost);

            // Initialize vote states
            const vCount = (fetchedPost.upvotes?.length || 0) - (fetchedPost.downvotes?.length || 0);
            setVoteCount(vCount);

            let status = 0;
            if (currentUser && fetchedPost.upvotes && fetchedPost.downvotes) {
                if (fetchedPost.upvotes.includes(currentUser._id)) status = 1;
                else if (fetchedPost.downvotes.includes(currentUser._id)) status = -1;
            }
            setUserVoteStatus(status);

            // Fetch Comments
            const commentsRes = await getComments(postId);
            setComments(commentsRes);

            // --- YÖNLENDİRME MANTIĞI ---
            // Eğer URL'de 'subName' yoksa (yani /post/:id rotasındaysak)
            // VEYA URL'deki subName yanlışsa, doğru URL'ye yönlendir.
            const correctSubName = fetchedPost.subcommunityId?.nameKey;

            // Şu anki path "/app/post/..." ile mi başlıyor kontrol et
            const isShortUrl = location.pathname.includes(`/app/post/${postId}`);

            if (correctSubName && (isShortUrl || subName !== correctSubName)) {
                // replace: true kullanarak geçmişi kirletmeden URL'yi değiştiriyoruz
                navigate(`/app/w/${correctSubName}/${fetchedPost._id}`, { replace: true });
            }

        } catch (err) {
            console.error(err);
            setError("Post bulunamadı veya silinmiş.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPostAndComments();
    }, [postId, subName, navigate, location.pathname, currentUser]);

    const handleVote = async (type) => {
        if (!currentUser) {
            navigate("/login");
            return;
        }

        const previousVoteStatus = userVoteStatus;
        const previousVoteCount = voteCount;

        let newVoteStatus = type;
        if (previousVoteStatus === type) {
            newVoteStatus = 0;
        }

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

    const handleSave = async () => {
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

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert("Link copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy: ", err);
        });
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        if (!currentUser) {
            navigate("/login");
            return;
        }

        setCommentLoading(true);
        try {
            await createComment({
                postId: post._id,
                desc: commentText
            });
            setCommentText("");
            // Refresh comments
            const commentsRes = await getComments(postId);
            setComments(commentsRes);
        } catch (err) {
            console.error("Comment failed", err);
            alert("Failed to post comment.");
        } finally {
            setCommentLoading(false);
        }
    };

    const refreshComments = async () => {
        const commentsRes = await getComments(postId);
        setComments(commentsRes);
    };

    // Organize comments into tree
    const rootComments = comments.filter(c => !c.parentId);
    const getReplies = (commentId) => {
        return comments
            .filter(c => c.parentId === commentId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Oldest first for replies usually
            .map(reply => ({
                ...reply,
                replies: getReplies(reply._id)
            }));
    };

    if (loading) return <div style={{ padding: "20px" }}> <LoadingAnimation/> </div>;
    if (error) return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
    if (!post) return null;

    // Tarih formatlama
    const dateStr = new Date(post.createdAt).toLocaleDateString() + " " + new Date(post.createdAt).toLocaleTimeString();

    return (
        <div style={{ display: "flex", justifyContent: "center", padding: "20px", backgroundColor: "#030303", minHeight: "100vh" }}>

            {/* Ana İçerik Kutusu */}
            <div style={{
                backgroundColor: "#1a1a1b", // Dark background
                maxWidth: "700px",
                width: "100%",
                borderRadius: "4px",
                border: "1px solid #343536", // Dark border
                display: "flex"
            }}>

                {/* SOL: Vote Bar (Basit Görünüm) */}
                <div style={{
                    width: "40px",
                    backgroundColor: "#161617", // Slightly darker
                    padding: "10px 0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderRight: "1px solid #343536"
                }}>
                    <button
                        onClick={() => handleVote(1)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: userVoteStatus === 1 ? "#006400" : "#818384" }}
                    >
                        ⬆
                    </button>
                    <span style={{ fontWeight: "bold", margin: "10px 0", color: userVoteStatus === 1 ? "#006400" : (userVoteStatus === -1 ? "#7193ff" : "#d7dadc") }}>
                        {voteCount}
                    </span>
                    <button
                        onClick={() => handleVote(-1)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: userVoteStatus === -1 ? "#7193ff" : "#818384" }}
                    >
                        ⬇
                    </button>
                </div>

                {/* SAĞ: Post İçeriği */}
                <div style={{ padding: "10px 20px", width: "100%" }}>

                    {/* Header: Subcommunity & User */}
                    <div style={{ fontSize: "12px", color: "#818384", marginBottom: "10px", display: "flex", alignItems: "center", gap: "5px" }}>
                        {post.subcommunityId?.iconImg && (
                            <img
                                src={post.subcommunityId.iconImg}
                                alt="icon"
                                style={{ width: "20px", height: "20px", borderRadius: "50%" }}
                            />
                        )}
                        <span
                            style={{ fontWeight: "bold", color: "#d7dadc", cursor: "pointer" }}
                            onClick={() => navigate(`/app/w/${post.subcommunityId?.nameKey}`)}
                        >
                            w/{post.subcommunityId?.nameKey}
                        </span>
                        <span>•</span>
                        <span>Posted by u/{post.userId?.username}</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                    </div>

                    {/* Title */}
                    <h1 style={{ fontSize: "22px", margin: "0 0 15px 0", color: "#d7dadc" }}>
                        {post.title}
                    </h1>

                    {/* Image (Varsa) */}
                    {post.img && (
                        <div style={{ marginBottom: "15px", display: "flex", justifyContent: "center", backgroundColor: "#030303", borderRadius: "4px", overflow: "hidden" }}>
                            <img
                                src={post.img}
                                alt={post.title}
                                style={{ maxWidth: "100%", maxHeight: "500px", objectFit: "contain" }}
                            />
                        </div>
                    )}

                    {/* Content (Text) */}
                    <div style={{ fontSize: "16px", lineHeight: "1.5", color: "#d7dadc", marginBottom: "20px", whiteSpace: "pre-wrap" }}>
                        {post.content}
                    </div>

                    {/* Footer: Comments & Actions */}
                    <div style={{ borderTop: "1px solid #343536", paddingTop: "10px", display: "flex", gap: "15px", color: "#818384", fontWeight: "bold", fontSize: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                            <span>💬</span> {comments.length} Comments
                        </div>
                        <div onClick={handleShare} style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                            <span>↪️</span> Share
                        </div>
                        <div onClick={handleSave} style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", color: isSaved ? "#006400" : "inherit" }}>
                            <span>{isSaved ? "🔖 Saved" : "🔖 Save"}</span>
                        </div>
                    </div>

                    {/* Yorum Alanı */}
                    <div style={{ marginTop: "30px" }}>
                        {currentUser ? (
                            <form onSubmit={handleCommentSubmit} style={{ marginBottom: "30px" }}>
                                <div style={{ fontSize: "12px", marginBottom: "5px", color: "#d7dadc" }}>
                                    Comment as <span style={{ color: "#006400" }}>{currentUser.username}</span>
                                </div>
                                <div style={{
                                    borderRadius: "4px",
                                    overflow: "hidden",
                                    backgroundColor: isFocused ? "#1a1a1b" : "#272729",
                                    border: isFocused ? "1px solid #d7dadc" : "1px solid #343536"
                                }}>
                                    <textarea
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        placeholder="What are your thoughts?"
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            border: "none",
                                            minHeight: "100px",
                                            resize: "vertical",
                                            outline: "none",
                                            backgroundColor: "transparent",
                                            display: "block",
                                            color: "#d7dadc"
                                        }}
                                    />
                                    <div style={{
                                        backgroundColor: "#272729",
                                        padding: "5px 10px",
                                        display: "flex",
                                        justifyContent: "flex-end"
                                    }}>
                                        <button
                                            type="submit"
                                            disabled={commentLoading || !commentText.trim()}
                                            style={{
                                                padding: "5px 20px",
                                                borderRadius: "20px",
                                                border: "none",
                                                backgroundColor: commentLoading || !commentText.trim() ? "#343536" : "#006400",
                                                color: "white",
                                                fontWeight: "bold",
                                                cursor: commentLoading || !commentText.trim() ? "default" : "pointer",
                                                opacity: commentLoading || !commentText.trim() ? 0.5 : 1
                                            }}
                                        >
                                            {commentLoading ? "Posting..." : "Comment"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div style={{ padding: "20px", border: "1px solid #343536", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                                <span style={{ color: "#818384", fontWeight: "bold" }}>Log in or sign up to leave a comment</span>
                                <div>
                                    <button onClick={() => navigate("/login")} style={{ padding: "5px 20px", borderRadius: "20px", border: "1px solid #006400", backgroundColor: "transparent", color: "#006400", fontWeight: "bold", marginRight: "10px", cursor: "pointer" }}>Log In</button>
                                    <button onClick={() => navigate("/register")} style={{ padding: "5px 20px", borderRadius: "20px", border: "none", backgroundColor: "#006400", color: "white", fontWeight: "bold", cursor: "pointer" }}>Sign Up</button>
                                </div>
                            </div>
                        )}

                        <hr style={{ border: "none", borderBottom: "1px solid #343536", marginBottom: "20px" }} />

                        {/* Comments List */}
                        <div>
                            {rootComments.map((comment) => (
                                <CommentCard
                                    key={comment._id}
                                    comment={comment}
                                    replies={getReplies(comment._id)}
                                    refreshComments={refreshComments}
                                />
                            ))}
                            {comments.length === 0 && (
                                <div style={{ textAlign: "center", color: "#818384", padding: "20px" }}>
                                    No comments yet. Be the first to share what you think!
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
