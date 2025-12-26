import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },

        // If null, it's a top-level comment. If set, it's a reply.
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },

        desc: { type: String, required: true },
        upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema);