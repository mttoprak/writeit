// client/src/pages/Feed.jsx
import { useState, useEffect, useContext } from "react";
import { getPosts } from "../services/api"; // Updated import
import PostCard from "../components/PostCard";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingAnimation from "../components/LoadingAnimation.jsx";

export default function Feed() {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // State'ler
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [storageError, setStorageError] = useState(null); // LocalStorage hatası için state

    // Pagination & Filter & Sort
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filter, setFilter] = useState("global"); // 'global' veya 'joined'
    const [sort, setSort] = useState("hot"); // 'hot', 'new', 'top'
    const [time, setTime] = useState("day"); // 'hour', 'day', 'week', 'month', 'year', 'all'

    // LocalStorage'da 'error' kontrolü
    useEffect(() => {
        const savedError = localStorage.getItem("error");
        if (savedError) {
            setStorageError(savedError);
        }
    }, []);

    const deleteerror=()=>{
        setStorageError(null);
    }

    // Filtre/Sort değiştiğinde her şeyi sıfırla
    useEffect(() => {
        setPosts([]);
        setPage(1);
        setHasMore(true);
        fetchPosts(1, filter, sort, time, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, sort, time]);

    // Postları çeken fonksiyon
    const fetchPosts = async (pageNum, filterType, sortType, timeRange, reset = false) => {
        try {
            setLoading(true);
            setError(null);

            // Updated API call
            const newPosts = await getPosts(pageNum, 10, sortType, timeRange, filterType);

            if (!Array.isArray(newPosts)) {
                console.error("Feed: API returned non-array data", newPosts);
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
                // Eski postların üzerine ekle
                setPosts((prev) => [...prev, ...newPosts]);
            }

        } catch (err) {
            console.error("Feed error:", err);
            // Eğer 401 hatası alırsak (Joined seçili ama login değilse)
            if (err.response && err.response.status === 401) {
                setError("Kendi akışını görmek için giriş yapmalısın.");
            } else {
                setError("Akış yüklenirken bir hata oluştu.");
            }
        } finally {
            setLoading(false);
        }
    };

    // "Daha Fazla Yükle" butonu
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage, filter, sort, time, false);
    };

    // Filtre değiştirme butonları için stil
    const getFilterButtonStyle = (type) => ({
        padding: "8px 16px",
        marginRight: "10px",
        borderRadius: "20px",
        border: "1px solid #006400",
        backgroundColor: filter === type ? "#006400" : "transparent",
        color: filter === type ? "white" : "#006400",
        cursor: "pointer",
        fontWeight: "bold"
    });

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
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>

            {/* --- YENİ EKLENEN KISIM: LocalStorage Error Overlay --- */}
            {storageError && (
                <div  style={{
                    position: "fixed",
                    top: "50px",
                    right: "20px",
                    zIndex: 9999, // En üstte görünmesi için
                    backgroundColor: "#1a1a1b", // Dark background
                    color: "#d32f2f",
                    padding: "15px 20px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                    fontWeight: "bold",
                    maxWidth: "300px",
                    border: "2px solid #b71c1c",
                    wordWrap: "break-word"
                }}>

                    {storageError}
                    <button onClick={deleteerror} style={{
                        position: "fixed",
                        top: "50px",
                        right: "20px",
                        zIndex: 9999,
                        backgroundColor: "transparent",
                        color: "#d32f2f",
                        padding: "3px 5px",
                        // borderRadius: "8px",
                        boxShadow: "none",
                        fontWeight: "bold",
                        maxWidth: "300px",
                        border: "none",
                        wordWrap: "break-word",
                        cursor: "pointer"
                    }}>X</button>
                </div>
            )}
            {/* ------------------------------------------------------ */}

            {/* Üst Kısım: Create Post & Filtreler */}
            <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "15px" }}>
                    {/* Create Post Input (Görsel) */}
                    {currentUser && (
                        <div style={{ flex: 1, marginRight: "20px" }}>
                            <input
                                type="text"
                                placeholder="Create Post"
                                onClick={() => navigate("/app/new-post")}
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "4px",
                                    border: "1px solid #343536",
                                    backgroundColor: "#272729",
                                    color: "#d7dadc"
                                }}
                            />
                        </div>
                    )}

                    {/* Global / Joined Filtre Butonları */}
                    <div>
                        <button
                            style={getFilterButtonStyle("global")}
                            onClick={() => setFilter("global")}
                        >
                            Global
                        </button>
                        <button
                            style={getFilterButtonStyle("joined")}
                            onClick={() => setFilter("joined")}
                        >
                            Your Communities
                        </button>
                    </div>
                </div>

                {/* Sort Bar (Hot, New, Top) */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
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
            </div>

            {/* Hata Mesajı (Normal Akış Hatası) */}
            {error && (
                <div style={{ padding: "15px", backgroundColor: "#3e1a1a", color: "#ff6b6b", borderRadius: "4px", marginBottom: "20px", border: "1px solid #b71c1c" }}>
                    {error}
                </div>
            )}

            {/* Post Listesi */}
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                ))}
            </div>

            {/* Boş Durum */}
            {!loading && posts.length === 0 && !error && (
                <div style={{ textAlign: "center", padding: "40px", color: "#818384" }}>
                    <h3>There isn't any post in here.</h3>
                    <p>try a different filter or join a new community. </p>
                </div>
            )}

            {/* Yükleniyor */}
            {loading && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                    {/*Loading...*/}
                    <LoadingAnimation/>
                </div>
            )}

            {/* Load More Butonu */}
            {!loading && hasMore && posts.length > 0 && (
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
            {
                !hasMore&& (<div style={{
                    display: "block",
                    margin: "2px auto",
                    padding: "10px 20px",
                    marginLeft: "35%",
                    color: "#818384",
                    border: "none",
                    borderRadius: "20px",
                    fontWeight: "bold"
                }}>
                    No more posts found.
                </div>)
            }
        </div>
    );
}
