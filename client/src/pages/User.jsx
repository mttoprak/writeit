// client/src/pages/User.jsx
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import api from "../services/api.js";
import NotFound from "./NotFound.jsx";
import PostCard from "../components/PostCard.jsx"; // PostCard'ı import et

const User = () => {
    const { username } = useParams();
    const { currentUser } = useContext(AuthContext);

    // Profil State'i
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [error, setError] = useState(null);

    // Post State'i
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true); // Daha fazla post var mı?

    // 1. Kullanıcı Profil Bilgisini Çek
    useEffect(() => {
        const fetchUser = async () => {
            setProfileLoading(true);
            setError(null);
            try {
                const res = await api.get(`/users/user/${username}`);
                setProfile(res.data);
            } catch (err) {
                console.error(err);
                setError("Kullanıcı bulunamadı.");
            } finally {
                setProfileLoading(false);
            }
        };

        if (username) {
            fetchUser();
            // Kullanıcı değiştiğinde postları sıfırla
            setPosts([]);
            setPage(1);
            setHasMore(true);
            fetchPosts(1, true); // İlk sayfayı çek (reset=true)
        }
    }, [username]);

    // 2. Kullanıcının Postlarını Çek (Fonksiyon)
    const fetchPosts = async (pageNum, reset = false) => {
        try {
            setPostsLoading(true);
            // Backend'e page ve limit gönderiyoruz
            const res = await api.get(`/posts/user/${username}?page=${pageNum}&limit=5`);

            if (res.data.length === 0) {
                setHasMore(false);
            }

            if (reset) {
                setPosts(res.data);
            } else {
                setPosts((prev) => [...prev, ...res.data]);
            }
        } catch (err) {
            console.error("Postlar çekilemedi:", err);
        } finally {
            setPostsLoading(false);
        }
    };

    // "Daha Fazla Yükle" butonuna basınca çalışır
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage, false);
    };

    if (profileLoading) return <div style={{ padding: "20px" }}>Yükleniyor...</div>;
    if (error) return <div style={{ padding: "20px", color: "red" }}><NotFound/></div>;
    if (!profile) return null;

    const isOwnProfile = currentUser && currentUser.username === profile.username;

    return (
        <div style={{ display: "flex", gap: "20px", padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>

            {/* SOL KOLON: Profil Kartı */}
            <div style={{ flex: "0 0 300px" }}>
                <div style={{
                    backgroundColor: "#1a1a1b", // Dark background
                    border: "1px solid #343536", // Dark border
                    borderRadius: "4px",
                    padding: "20px",
                    textAlign: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}>
                    <div style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        margin: "0 auto 15px auto",
                        backgroundColor: "#006400", // Green profile bg
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "48px",
                        color: "white",
                        fontWeight: "bold"
                    }}>
                        {profile.profilePic ? (
                            <img src={profile.profilePic} alt={profile.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <span>{profile.username[0].toUpperCase()}</span>
                        )}
                    </div>

                    <h2 style={{ margin: "0 0 5px 0", fontSize: "22px", color: "#d7dadc" }}>{profile.displayName}</h2>
                    <div style={{ color: "#818384", fontSize: "14px", marginBottom: "15px" }}>u/{profile.username}</div>

                    <p style={{ fontSize: "14px", color: "#d7dadc", lineHeight: "1.5", marginBottom: "20px" }}>
                        {profile.about || "No description provided."}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-around", fontSize: "14px", color: "#d7dadc", marginBottom: "20px" }}>
                        <div>
                            <div style={{ fontWeight: "bold" }}>Karma</div>
                            <div>{profile.karma || 0}</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: "bold" }}>Joined</div>
                            <div>{new Date(profile.createdAt).toLocaleDateString()}</div>
                        </div>
                    </div>

                    {isOwnProfile && (
                        <button style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "20px",
                            border: "1px solid #d7dadc",
                            backgroundColor: "transparent",
                            color: "#d7dadc",
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}>
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* SAĞ KOLON: Postlar */}
            <div style={{ flex: 1 }}>
                <h3 style={{ marginTop: 0, marginBottom: "15px", borderBottom: "1px solid #343536", paddingBottom: "10px", color: "#d7dadc" }}>Posts</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>

                {/* Boş Durum */}
                {!postsLoading && posts.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px", color: "#818384" }}>
                        <h3>u/{profile.username} hasn't posted anything yet.</h3>
                    </div>
                )}

                {/* Yükleniyor */}
                {postsLoading && <div style={{ padding: "20px", textAlign: "center", color: "#818384" }}>Loading posts...</div>}

                {/* Load More */}
                {!postsLoading && hasMore && posts.length > 0 && (
                    <button
                        onClick={handleLoadMore}
                        style={{
                            display: "block",
                            margin: "20px auto",
                            padding: "10px 20px",
                            backgroundColor: "#006400",
                            color: "white",
                            border: "none",
                            borderRadius: "20px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Load More
                    </button>
                )}
            </div>
        </div>
    );
};

export default User;
