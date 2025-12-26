// api/index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import auth from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import SubRoutes from "./routes/Subcommunities.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";

dotenv.config();

const app = express();

const connect = async () => {
    if (!process.env.MONGO_URI) {
        console.error("Error: MONGO_URI environment variable is not defined.");
        process.exit(1);
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB Atlas");
        console.log("Backend server running on port 8800");
    } catch (error) {
        console.error("DB Connection Error:", error);
    }
};

mongoose.connection.on("disconnected", () => {
    console.log("mongoDB disconnected!");
});

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(morgan("common"));

// DEV: herkese izin ver (credentials ile uyumlu: origin true)
const corsOptions = {
    origin: "https://writeit.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Express 5: "*" yerine regex path kullan
app.options(/.*/, cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/users", auth, userRoutes);
app.use("/api/Subs", auth, SubRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);


app.use((req, res) => {
    res.status(200).send("API is running...");
});

const PORT = process.env.PORT || 8800;

app.listen(PORT, () => {
    connect();
    console.log(`Backend server running on port ${PORT}`);
});
