import express from "express";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Create a comment
router.post("/create", auth, async (req, res) => {
    const { postId, desc, parentId } = req.body;
    const userId = req.user.id;

    try {
        if (!desc || !postId) {
            return res.status(400).json({ error: "Description and Post ID are required." });
        }

        const newComment = new Comment({
            userId,
            postId,
            parentId: parentId || null,
            desc
        });

        const savedComment = await newComment.save();

        // Add comment ID to Post's commentIDs array
        await Post.findByIdAndUpdate(postId, {
            $push: { commentIDs: savedComment._id }
        });

        // Populate user info for immediate display
        await savedComment.populate("userId", "username profilePic");

        res.status(201).json(savedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get comments for a post
router.get("/post/:postId", async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId })
            .populate("userId", "username profilePic")
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Vote on a comment
router.put("/vote/:id", auth, async (req, res) => {
    const { id } = req.params;
    const { voteType } = req.body; // 1 (upvote) or -1 (downvote)
    const userId = req.user.id;

    try {
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Check current vote status
        let currentVote = 0;
        if (comment.upvotes.includes(userId)) currentVote = 1;
        else if (comment.downvotes.includes(userId)) currentVote = -1;

        // Remove existing vote
        comment.upvotes = comment.upvotes.filter((uid) => uid.toString() !== userId);
        comment.downvotes = comment.downvotes.filter((uid) => uid.toString() !== userId);

        // Add new vote if it's not a toggle-off
        if (currentVote !== voteType) {
            if (voteType === 1) {
                comment.upvotes.push(userId);
            } else if (voteType === -1) {
                comment.downvotes.push(userId);
            }
        }

        const savedComment = await comment.save();

        const voteCount = savedComment.upvotes.length - savedComment.downvotes.length;

        let newVoteStatus = 0;
        if (savedComment.upvotes.includes(userId)) newVoteStatus = 1;
        else if (savedComment.downvotes.includes(userId)) newVoteStatus = -1;

        res.status(200).json({ voteCount, userVoteStatus: newVoteStatus });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

