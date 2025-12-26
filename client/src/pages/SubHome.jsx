// client/src/pages/SubHome.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { getPosts } from "../services/api"; // Updated import
import LoadingAnimation from "../components/LoadingAnimation.jsx";
import PostCard from "../components/PostCard"; // Import PostCard

export default function SubHome() {
    const { subName } = useParams();

    const [sub, setSub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Post States
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [sort, setSort] = useState("hot");
    const [time, setTime] = useState("day");

    // Buton işlemleri için state
    const [joining, setJoining] = useState(false);
    const [hover, setHover] = useState(false);

    useEffect(() => {
        const fetchSub = async () => {
            try {
                setLoading(true);
                setError(null);
                // Backend'den isMember bilgisi de geliyor
                const res = await api.get(`/Subs/get-by-name/${subName}`);
                setSub(res.data);
            } catch (err) {
                console.error(err);
                setError("Topluluk bulunamadı veya bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchSub();
    }, [subName]);

    // Save to Recently Visited
    useEffect(() => {
        if (sub) {
            const recent = JSON.parse(localStorage.getItem("recentSubs") || "[]");

            // Remove if already exists to avoid duplicates and move to top
            const filtered = recent.filter(s => s.nameKey !== sub.nameKey);

            // Add to beginning
            filtered.unshift({
                nameKey: sub.nameKey,
                displayName: sub.displayName,
                iconImg: sub.iconImg
            });

            // Keep only last 5
            const trimmed = filtered.slice(0, 5);

            localStorage.setItem("recentSubs", JSON.stringify(trimmed));
        }
    }, [sub]);

    // Fetch Posts Effect
    useEffect(() => {
        setPosts([]);
        setPage(1);
        setHasMore(true);
        fetchPosts(1, sort, time, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subName, sort, time]);

    const fetchPosts = async (pageNum, sortType, timeRange, reset = false) => {
        try {
            setPostsLoading(true);
            // Filter is 'global' because we are filtering by subName anyway
            const newPosts = await getPosts(pageNum, 10, sortType, timeRange, "global", subName);

            if (!Array.isArray(newPosts)) {
                console.error("SubHome: API returned non-array data", newPosts);
                setHasMore(false);
                if (reset) setPosts([]);
                return;
            }

            if (newPosts.length === 0) {
                setHasMore(false);
            }

            if (reset) {
                setPosts(newPosts);
            } else {
                setPosts((prev) => [...prev, ...newPosts]);
            }
        } catch (err) {
            console.error("SubHome posts error:", err);
        } finally {
            setPostsLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage, sort, time, false);
    };

    const handleJoinLeave = async () => {
        if (joining) return; // Çift tıklamayı önle
        setJoining(true);

        try {
            if (sub.isMember) {
                // Üye ise çık
                await api.post(`/Subs/leave/${sub.nameKey}`);
                setSub((prev) => ({ ...prev, isMember: false }));
            } else {
                // Üye değilse katıl
                await api.post(`/Subs/join/${sub.nameKey}`);
                setSub((prev) => ({ ...prev, isMember: true }));
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "İşlem başarısız.");
        } finally {
            setJoining(false);
        }
    };

    if (loading) return (
        <div style={{
            display: "flex",
            justifyContent: "center", // Yatayda ortalar
            alignItems: "center",     // Dikeyde ortalar (YENİ)
            minHeight: "50vh",       // Tam ekran yüksekliği (YENİ)
            // ...diğer stiller
        }}>
            <LoadingAnimation/>
        </div>
    );
    if (error) return <div style={{ padding: "20px", color: "red" }}>{error}</div>;

    let btnText = "Join";
    let btnStyle = {
        backgroundColor: "#006400",
        color: "white",
        border: "1px solid #006400"
    };

    if (sub.isMember) {
        if (hover) {
            btnText = "Leave";
            btnStyle = {
                backgroundColor: "transparent",
                color: "#ff0000",
                border: "1px solid #ff0000"
            };
        } else {
            btnText = "Joined";
            btnStyle = {
                backgroundColor: "transparent",
                color: "#006400",
                border: "1px solid #006400"
            };
        }
    }

    const getSortButtonStyle = (type) => ({
        padding: "6px 12px",
        marginRight: "5px",
        borderRadius: "20px",
        border: "none",
        backgroundColor: sort === type ? "#272729" : "transparent",
        color: sort === type ? "#006400" : "#818384",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px"
    });

    return (
        <div className="sub-page">
            {/* Banner Alanı */}
            <div style={{
                height: "150px",
                backgroundColor: sub.bannerImg ? "transparent" : "#006400",
                backgroundImage: sub.bannerImg ? `url(${sub.bannerImg})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}>
            </div>

            {/* Başlık, İkon ve Buton Alanı */}
            <div style={{ padding: "0 20px", display: "flex", alignItems: "flex-end", marginTop: "-20px" }}>

                {sub.iconImg ? (
                    <img
                        src={sub.iconImg}
                        alt="icon"
                        style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            border: "4px solid #1a1a1b",
                            backgroundColor: "white",
                            objectFit: "cover"
                        }}
                    />
                ) : (
                    <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        border: "4px solid #1a1a1b",
                        backgroundColor: "#272729",
                        color: "#d7dadc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: "bold",
                        textAlign: "center",
                        wordBreak: "break-word",
                        padding: "5px",
                        boxSizing: "border-box"
                    }}>
                        w/{sub.nameKey}
                    </div>
                )}

                <div style={{ marginLeft: "15px", marginBottom: "5px" }}>
                    <h1 style={{ margin: 0, fontSize: "28px", color: "#d7dadc" }}>{sub.displayName}</h1>
                    <span style={{ color: "#818384", fontSize: "14px" }}>w/{sub.nameKey}</span>
                </div>

                {/* JOIN / LEAVE BUTTON */}
                <button
                    onClick={handleJoinLeave}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    disabled={joining}
                    style={{
                        marginLeft: "auto", // Sağa yasla
                        marginBottom: "10px",
                        padding: "5px 24px",
                        borderRadius: "999px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        cursor: joining ? "wait" : "pointer",
                        transition: "all 0.2s ease-in-out",
                        ...btnStyle
                    }}
                >
                    {joining ? "..." : btnText}
                </button>
            </div>

            {/* İçerik Alanı */}
            <div style={{ padding: "20px", display: "flex", gap: "20px" }}>
                {/* Sol Taraf: Postlar */}
                <div style={{ flex: 2 }}>
                    {/* Sort Bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", borderBottom: "1px solid #343536", paddingBottom: "10px" }}>
                        <button style={getSortButtonStyle("hot")} onClick={() => setSort("hot")}>🔥 Hot</button>
                        <button style={getSortButtonStyle("new")} onClick={() => setSort("new")}>✨ New</button>
                        <button style={getSortButtonStyle("top")} onClick={() => setSort("top")}>🏆 Top</button>

                        {/* Time Range Selector for Top */}
                        {sort === "top" && (
                            <select
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                style={{ padding: "5px", borderRadius: "4px", border: "1px solid #343536", marginLeft: "5px", backgroundColor: "#272729", color: "#d7dadc" }}
                            >
                                <option value="hour">Now</option>
                                <option value="day">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                                <option value="all">All Time</option>
                            </select>
                        )}
                    </div>

                    {/* Post Listesi */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {posts.map((post) => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>

                    {/* Boş Durum */}
                    {!postsLoading && posts.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px", color: "#818384" }}>
                            <h3>No posts yet.</h3>
                            <p>Be the first to post in w/{sub.nameKey}!</p>
                        </div>
                    )}

                    {/* Yükleniyor */}
                    {postsLoading && (
                        <div style={{ textAlign: "center", padding: "20px" }}>
                            <LoadingAnimation/>
                        </div>
                    )}

                    {/* Load More Butonu */}
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

                {/* Sağ Taraf: Aside (About) */}
                <div style={{ flex: 1, backgroundColor: "#1a1a1b", padding: "15px", borderRadius: "5px", height: "fit-content", border: "1px solid #343536" }}>
                    <h4 style={{ marginTop: 0, color: "#d7dadc" }}>About Community</h4>
                    <p style={{ color: "#d7dadc" }}>{sub.description || "No description provided."}</p>
                    <hr style={{ border: "none", borderBottom: "1px solid #343536" }} />
                    <div style={{ fontSize: "14px", color: "#818384" }}>
                        Created at: {new Date(sub.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        </div>
    );
}
