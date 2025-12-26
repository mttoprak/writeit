import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { voteComment, createComment } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function CommentCard({ comment, replies, refreshComments }) {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Vote state
    const [voteCount, setVoteCount] = useState(
        (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)
    );
    const [userVoteStatus, setUserVoteStatus] = useState(() => {
        if (!currentUser) return 0;
        if (comment.upvotes?.includes(currentUser._id)) return 1;
        if (comment.downvotes?.includes(currentUser._id)) return -1;
        return 0;
    });

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
            const res = await voteComment(comment._id, type);
            setVoteCount(res.voteCount);
            setUserVoteStatus(res.userVoteStatus);
        } catch (err) {
            console.error("Vote failed", err);
            setUserVoteStatus(previousVoteStatus);
            setVoteCount(previousVoteCount);
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        if (!currentUser) {
            navigate("/login");
            return;
        }

        setSubmitting(true);
        try {
            await createComment({
                postId: comment.postId,
                parentId: comment._id,
                desc: replyText
            });
            setReplyText("");
            setReplying(false);
            refreshComments(); // Refresh to show new reply
        } catch (err) {
            console.error("Reply failed", err);
            alert("Failed to post reply.");
        } finally {
            setSubmitting(false);
        }
    };

    const dateStr = new Date(comment.createdAt).toLocaleDateString() + " " + new Date(comment.createdAt).toLocaleTimeString();

    return (
        <div style={{ marginTop: "15px", paddingLeft: "10px", borderLeft: "2px solid #343536" }}>
            <div style={{ display: "flex", gap: "10px" }}>
                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                    {comment.userId?.profilePic ? (
                        <img
                            src={comment.userId.profilePic}
                            alt="avatar"
                            style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }}
                        />
                    ) : (
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#272729", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", color: "#d7dadc" }}>
                            {comment.userId?.username?.[0]?.toUpperCase()}
                        </div>
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    {/* Header */}
                    <div style={{ fontSize: "12px", color: "#818384", marginBottom: "5px" }}>
                        <span style={{ fontWeight: "bold", color: "#d7dadc", marginRight: "5px" }}>
                            {comment.userId?.username}
                        </span>
                        <span>{dateStr}</span>
                    </div>

                    {/* Content */}
                    <div style={{ fontSize: "14px", marginBottom: "5px", color: "#d7dadc" }}>
                        {comment.desc}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", fontWeight: "bold", color: "#818384" }}>
                        {/* Vote */}
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <button
                                onClick={() => handleVote(1)}
                                style={{ border: "none", background: "none", cursor: "pointer", color: userVoteStatus === 1 ? "#006400" : "inherit", fontSize: "16px" }}
                            >
                                ⬆
                            </button>
                            <span style={{ color: userVoteStatus === 1 ? "#006400" : (userVoteStatus === -1 ? "#7193ff" : "inherit") }}>
                                {voteCount}
                            </span>
                            <button
                                onClick={() => handleVote(-1)}
                                style={{ border: "none", background: "none", cursor: "pointer", color: userVoteStatus === -1 ? "#7193ff" : "inherit", fontSize: "16px" }}
                            >
                                ⬇
                            </button>
                        </div>

                        {/* Reply Button */}
                        <button
                            onClick={() => setReplying(!replying)}
                            style={{ border: "none", background: "none", cursor: "pointer", color: "inherit", display: "flex", alignItems: "center", gap: "5px" }}
                        >
                            💬 Reply
                        </button>
                    </div>

                    {/* Reply Form */}
                    {replying && (
                        <form onSubmit={handleReplySubmit} style={{ marginTop: "10px" }}>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="What are your thoughts?"
                                style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #343536", minHeight: "80px", resize: "vertical", backgroundColor: "#272729", color: "#d7dadc" }}
                            />
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "5px" }}>
                                <button
                                    type="button"
                                    onClick={() => setReplying(false)}
                                    style={{ padding: "5px 10px", border: "none", background: "none", cursor: "pointer", color: "#818384", fontWeight: "bold" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !replyText.trim()}
                                    style={{ padding: "5px 15px", borderRadius: "20px", border: "none", backgroundColor: submitting ? "#343536" : "#006400", color: "white", fontWeight: "bold", cursor: submitting ? "default" : "pointer" }}
                                >
                                    {submitting ? "Posting..." : "Reply"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {replies && replies.length > 0 && (
                <div style={{ marginTop: "10px" }}>
                    {replies.map((reply) => (
                        <CommentCard
                            key={reply._id}
                            comment={reply}
                            replies={reply.replies}
                            refreshComments={refreshComments}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
