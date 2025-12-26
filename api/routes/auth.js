import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

const router = express.Router();

// --- REGISTER ---
router.post('/register', async (req, res) => {
    try {
        let {username, displayName, email, password} = req.body;

        // SANITIZATION
        if (!displayName || displayName.trim().length === 0) {
            displayName = undefined;
        }

        if (!username || !email || !password) {
            return res.status(400).json({error: "All fields are required."});
        }

        const userRegex = /^[a-z0-9_]+$/;

        if(!userRegex.test(username)) {
            return res.status(400).json({error: "Invalid username format."});
        }

        if (username.length < 3) {
            return res.status(400).json({error: "Username must be at least 3 characters long."});
        }

        if (username.length > 50) {
            return res.status(400).json({error: "Username must be maximum 50 characters long."});
        }

        if (displayName) {
            if (displayName.length < 3) {
                return res.status(400).json({error: "Display Name must be at least 3 characters long."});
            }
            if (displayName.length > 30) {
                return res.status(400).json({error: "Display Name must be maximum 50 characters long."});
            }
        }

        if (password.length < 8) {
            return res.status(400).json({error: "Password must be at least 8 characters long."});
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({error: "Invalid email format."});
        }

        const existingUser = await User.findOne({$or: [{email}, {username}]});

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({error: "Email already exists"});
            }
            if (existingUser.username === username) {
                return res.status(400).json({error: "Username already exists"});
            }
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({username, displayName, email, password: passwordHash});

        await newUser.save();

        const userObj = newUser.toObject();
        delete userObj.password;

        return res.status(201).json(userObj);

    } catch (err) {
        console.error(err);
        res.status(500).json({error: err.message});
    }
});

// --- GET USER ---
router.get('/users/:username', async (req, res) => {
    try {
        const {username} = req.params;
        const user = await User.findOne({username}).select('-password');

        if (!user) {
            return res.status(404).json({error: "User not found."});
        }
        res.json(user);

    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// --- LOGIN (GÜNCELLENDİ) ---
router.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body;

        const user = await User.findOne({username});

        if (!user) {
            return res.status(404).json({error: "Username or Password is wrong."});
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(404).json({error: "Username or Password is wrong."});
        }

        // Env gelmezse varsayılan 7 gün
        const token = jwt.sign(
            {id: user._id},
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRE || "7d"}
        );

        const userObj = user.toObject();
        delete userObj.password;

        // Render ve Netlify için ZORUNLU çerez ayarları:
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: true,      // HTTPS zorunlu (Render için şart)
            sameSite: "none",  // Cross-site cookie (Render <-> Netlify için şart)
        });

        return res.status(200).json({
            msg: "Login successful", token, user: userObj
        });

    } catch (err) {
        return res.status(500).json({error: err.message});
    }
});

// --- LOGOUT (GÜNCELLENDİ) ---
router.post('/logout', (req, res) => {
    try {
        // Çerezi silerken oluştururken kullandığın ayarların AYNISINI kullanmalısın.
        // Yoksa tarayıcı silmez.
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,      // Login'deki ile aynı olmalı
            sameSite: "none",  // Login'deki ile aynı olmalı
        });

        return res.status(200).json({msg: "Logout successful"});
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
});

export default router;