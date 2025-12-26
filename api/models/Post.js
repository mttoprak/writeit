import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        subcommunityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subcommunity",
            required: true
        },

        title: { type: String, required: true },
        content: { type: String, required: true },
        img: { type: String },
        upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        commentIDs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment',
            }
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Post", PostSchema);