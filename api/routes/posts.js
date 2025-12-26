// api/routes/posts.js
import express from "express";
import mongoose from "mongoose"; // <--- BU SATIRI EKLE
import Post from "../models/Post.js";
import Subcommunity from "../models/Subcommunity.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";

const router = express.Router();

// POST /api/posts/create
router.post("/create", auth, async (req, res) => {
    const { title, content, img, subcommunityName } = req.body;
    const userId = req.user.id; // auth middleware'den geliyor

    try {
        // 1. Validasyonlar
        if (!title || !content || !subcommunityName) {
            return res.status(400).json({ error: "Title, content and subcommunity are required." });
        }

        // 2. Topluluğu bul (İsimden ID'ye gitmemiz lazım)
        const sub = await Subcommunity.findOne({ nameKey: subcommunityName });
        if (!sub) {
            return res.status(404).json({ error: "Subcommunity not found." });
        }
        if (title.length < 3) {
            return res.status(400).json({error: "Title has to be at least 3 characters."});
        } else if (title.length > 150) {
            return res.status(400).json({error: "Title cannot exceed 150 characters."});
        }



        // 3. Postu oluştur
        const newPost = new Post({
            userId,
            subcommunityId: sub._id,
            title,
            content,
            img: img || "" // Resim opsiyonel
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


router.get("/get/:id", auth,async (req, res) => {
    try {
        const { id } = req.params;


        const post = await Post.findById(id)
            .populate("userId", "username displayName profilePic") // Yazarın sadece bu alanlarını al
            .populate("subcommunityId", "nameKey displayName iconImg"); // Topluluğun sadece bu alanlarını al

        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/user/:username", auth, async (req, res) => {
    try {
        const { username } = req.params;
        // Query parametrelerinden sayfa numarasını al (varsayılan 1)
        const page = parseInt(req.query.page) || 1;
        // Her sayfada kaç post gösterilecek (varsayılan 10)
        const limit = parseInt(req.query.limit) || 10;
        // Kaç tane atlanacak (skip)
        const skip = (page - 1) * limit;

        // 1. Username'den User ID'yi bul
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Postları bul (Pagination ile)
        const posts = await Post.find({ userId: user._id })
            .sort({ createdAt: -1 }) // En yeniden eskiye
            .skip(skip)
            .limit(limit)
            .populate("subcommunityId", "nameKey iconImg") // PostCard için gerekli
            .populate("userId", "username profilePic");   // PostCard için gerekli

        // 3. İçeriği kısalt (Truncate)
        // Veritabanından gelen veri mongoose dökümanıdır, üzerinde değişiklik yapmak için objeye çeviriyoruz.
        const truncatedPosts = posts.map(post => {
            const postObj = post.toObject();
            if (postObj.content.length > 150) {
                postObj.content = postObj.content.substring(0, 150) + "...";
            }
            return postObj;
        });

        res.status(200).json(truncatedPosts);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// api/posts/feed (Generic Feed Endpoint)
router.get("/feed", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sortType = req.query.sort || "hot"; // hot, new, top
        const timeRange = req.query.t || "day";   // hour, day, week, month, year, all
        const filterType = req.query.filter || "global"; // global, joined
        const subName = req.query.subName; // Optional: specific subcommunity

        console.log(`Feed Request: page=${page}, limit=${limit}, sort=${sortType}, time=${timeRange}, filter=${filterType}, subName=${subName}`);

        const writeitEpoch = new Date("2025-01-01T00:00:00.000Z");

        // --- 1. KULLANICI KONTROLÜ ---
        let currentUser = null;
        const token = req.cookies?.token;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                currentUser = await User.findById(decoded.id);
            } catch (err) {
                console.log("Token geçersiz veya yok, misafir modunda devam ediliyor.");
            }
        }

        const userIdObj = currentUser ? new mongoose.Types.ObjectId(currentUser._id) : null;

        // --- 2. FİLTRELEME MANTIĞI (MATCH STAGE) ---
        let matchStage = {};

        // A. Subcommunity Filtresi (Öncelikli)
        if (subName) {
            // Case-insensitive search for subcommunity
            const sub = await Subcommunity.findOne({ nameKey: { $regex: new RegExp(`^${subName}$`, 'i') } });
            if (!sub) {
                console.log(`Subcommunity not found: ${subName}`);
                return res.status(404).json({ error: "Subcommunity not found." });
            }
            matchStage.subcommunityId = sub._id;
        }
        // B. Joined Filtresi (Sadece subName yoksa ve filter=joined ise)
        else if (filterType === "joined") {
            if (!currentUser) {
                return res.status(401).json({ error: "Kendi akışını görmek için giriş yapmalısın." });
            }
            matchStage.subcommunityId = { $in: currentUser.joinedSubcommunities || [] };
        }

        // C. Zaman Filtresi (Sadece TOP sıralaması için)
        if (sortType === "top" && timeRange !== "all") {
            const now = new Date();
            let startDate = new Date();

            switch (timeRange) {
                case "hour": startDate.setHours(now.getHours() - 1); break;
                case "day": startDate.setDate(now.getDate() - 1); break;
                case "week": startDate.setDate(now.getDate() - 7); break;
                case "month": startDate.setMonth(now.getMonth() - 1); break;
                case "year": startDate.setFullYear(now.getFullYear() - 1); break;
                default: break; // 'all' or invalid
            }
            matchStage.createdAt = { $gte: startDate };
        }

        // --- 3. AGGREGATION PIPELINE ---
        const pipeline = [
            { $match: matchStage },

            // Upvote/Downvote sayılarını al
            {
                $addFields: {
                    upvoteCount: { $size: { $ifNull: ["$upvotes", []] } },
                    downvoteCount: { $size: { $ifNull: ["$downvotes", []] } },
                }
            },
            // Skor Hesapla
            {
                $addFields: {
                    score: { $subtract: ["$upvoteCount", "$downvoteCount"] },
                }
            }
        ];

        // HOT Sıralaması için ek hesaplamalar
        if (sortType === "hot") {
            pipeline.push(
                {
                    $addFields: {
                        seconds: {
                            $divide: [
                                { $subtract: ["$createdAt", writeitEpoch] },
                                1000
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        order: {
                            $log10: { $max: [{ $abs: "$score" }, 1] }
                        },
                        sign: {
                            $cond: [
                                { $gt: ["$score", 0] }, 1,
                                { $cond: [{ $lt: ["$score", 0] }, -1, 0] }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        hotScore: {
                            $add: [
                                "$order",
                                {
                                    $divide: [
                                        { $multiply: ["$sign", "$seconds"] },
                                        45000
                                    ]
                                }
                            ]
                        }
                    }
                }
            );
        }

        // --- 4. SIRALAMA (SORT STAGE) ---
        let sortStage = {};
        if (sortType === "new") {
            sortStage = { createdAt: -1 };
        } else if (sortType === "top") {
            sortStage = { score: -1 };
        } else { // hot (default)
            sortStage = { hotScore: -1 };
        }
        pipeline.push({ $sort: sortStage });

        // --- 5. SAYFALAMA ---
        pipeline.push(
            { $skip: skip },
            { $limit: limit }
        );

        // --- 6. LOOKUP & PROJECTION ---
        pipeline.push(
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId"
                }
            },
            { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "subcommunities",
                    localField: "subcommunityId",
                    foreignField: "_id",
                    as: "subcommunityId"
                }
            },
            { $unwind: { path: "$subcommunityId", preserveNullAndEmptyArrays: true } },
            // Filter out posts where user or subcommunity is missing (optional, but good for data integrity)
            {
                $match: {
                    "userId._id": { $exists: true },
                    "subcommunityId._id": { $exists: true }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    content: 1,
                    img: 1,
                    createdAt: 1,
                    commentIDs: 1,
                    voteCount: "$score", // Calculated score
                    hotScore: { $ifNull: ["$hotScore", 0] }, // Ensure hotScore exists

                    // Kullanıcının oy durumu
                    userVoteStatus: {
                        $cond: [
                            { $in: [userIdObj, { $ifNull: ["$upvotes", []] }] },
                            1,
                            {
                                $cond: [
                                    { $in: [userIdObj, { $ifNull: ["$downvotes", []] }] },
                                    -1,
                                    0
                                ]
                            }
                        ]
                    },

                    "userId._id": 1,
                    "userId.username": 1,
                    "userId.displayName": 1,
                    "userId.profilePic": 1,
                    "subcommunityId._id": 1,
                    "subcommunityId.nameKey": 1,
                    "subcommunityId.displayName": 1,
                    "subcommunityId.iconImg": 1
                }
            }
        );

        const posts = await Post.aggregate(pipeline);

        // İçeriği 150 karakterle sınırla
        const truncatedPosts = posts.map(post => {
            if (post.content && post.content.length > 150) {
                post.content = post.content.substring(0, 150) + "...";
            }
            return post;
        });

        res.status(200).json(truncatedPosts);

    } catch (err) {
        console.error("Feed Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.put("/vote/:id", auth, async (req, res) => {
    const { id } = req.params;
    const { voteType } = req.body; // 1 (upvote) or -1 (downvote)
    const userId = req.user.id;

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Mevcut oy durumunu kontrol et
        let currentVote = 0;
        if (post.upvotes.includes(userId)) currentVote = 1;
        else if (post.downvotes.includes(userId)) currentVote = -1;

        // Her durumda önce kullanıcının oyunu temizle
        post.upvotes = post.upvotes.filter((id) => id.toString() !== userId);
        post.downvotes = post.downvotes.filter((id) => id.toString() !== userId);

        // Eğer kullanıcı aynı oyu tekrar verdiyse (toggle), işlem tamam (zaten sildik).
        // Eğer farklı bir oy verdiyse veya hiç oyu yoksa, yeni oyu ekle.
        if (currentVote !== voteType) {
            if (voteType === 1) {
                post.upvotes.push(userId);
            } else if (voteType === -1) {
                post.downvotes.push(userId);
            }
        }

        const savedPost = await post.save();

        // Güncel oy sayılarını döndür
        const voteCount = savedPost.upvotes.length - savedPost.downvotes.length;

        // Yeni durumu döndür
        let newVoteStatus = 0;
        if (savedPost.upvotes.includes(userId)) newVoteStatus = 1;
        else if (savedPost.downvotes.includes(userId)) newVoteStatus = -1;

        res.status(200).json({ voteCount, userVoteStatus: newVoteStatus });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/getvote/:postID", auth, async (req, res) => {
    try {
        const { postID } = req.params;
        const userId = req.user.id;

        const post = await Post.findById(postID);

        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        let userVoteStatus = 0;

        if (post.upvotes.includes(userId)) {
            userVoteStatus = 1;
        } else if (post.downvotes.includes(userId)) {
            userVoteStatus = -1;
        }


        res.status(200).json(userVoteStatus);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


export default router;
