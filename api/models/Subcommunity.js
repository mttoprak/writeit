import mongoose from "mongoose";

const SubcommunitySchema = new mongoose.Schema(
    {
        nameKey: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minLength: 3,
            maxLength: 21,
            match: [/^[a-z0-9_]+$/, 'Name key can only contain letters, numbers, and underscores.']
        },
        displayName: {
            type: String,
            required: true,
            trim: true,
            maxLength: 50
        },
        description: {
            type: String,
            maxLength: 500
        },
        bannerImg: { type: String, default: "" },
        iconImg: { type: String, default: "" },

        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        admin:[ {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }],

        // Member Count
        members: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Subcommunity", SubcommunitySchema);