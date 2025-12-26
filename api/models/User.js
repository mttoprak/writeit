import mongoose from "mongoose";

const UserAuthoritySchema = new mongoose.Schema(
    {
        subcommunity: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subcommunity",
            required: true
        },
        role: {
            type: String,
            enum: ["owner", "admin", "moderator", "member"],
            default: "member",
            required: true
        }
    },
    { _id: false }
);

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            // VALIDATION ADDED HERE
            minLength: [3, 'Username must be at least 3 characters long.'],
            maxLength: [21, 'Username must be less than 21 characters long.'],
            match: [/^[a-z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.']
        },

        displayName: {
            type: String,
            required: true,
            trim: true,
            // Display name allows spaces and special chars, but keeps length limits
            minLength: [3, 'Display name must be at least 3 characters long.'],
            maxLength: [30, 'Display name must be less than 30 characters long.'],
            default: function() {
                return this.username;
            }
        },

        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profilePic: { type: String, default: "" },
        about: { type: String, default: "" },
        karma: { type: Number, default: 0 },

        authorities: [UserAuthoritySchema],

        joinedSubcommunities: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Subcommunity" }
        ],

        savedPosts: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Post" }
        ],

        votedPosts: [
            { type: mongoose.Schema.Types.ObjectId, ref: "Post" }
        ]
    },
    { timestamps: true }
);

export default mongoose.model("User", UserSchema);