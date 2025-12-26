import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

const router = express.Router();

router.post('/register', async (req, res) => {

    try {
        // 1. Use 'let' instead of 'const' so we can modify displayName
        let {username, displayName, email, password} = req.body;

        // 2. SANITIZATION:
        // If displayName is empty string "", null, or just spaces, set it to undefined.
        // This tells Mongoose: "Use the default function (username)!"
        if (!displayName || displayName.trim().length === 0) {
            displayName = undefined;
        }

        if (!username || !email || !password) {
            return res.status(400).json({error: "All fields are required."});
        }

        // Fixed Regex: Added ^ to ensure the WHOLE string matches, not just the end
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

        // 3. SAFE VALIDATION:
        // Only check length if the user actually provided a custom name.
        if (displayName) {
            if (displayName.length < 3) {
                return res.status(400).json({error: "Display Name must be at least 3 characters long."});
            }

            // Note: Your Mongoose schema said 30, but here you check 50.
            // I kept it 50 to match your code, but make sure they match!
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

        // If displayName is 'undefined' here, Mongoose fills it with 'username' automatically
        const newUser = new User({username, displayName, email, password: passwordHash});

        await newUser.save();

        const userObj = newUser.toObject();
        delete userObj.password;

        return res.status(201).json(userObj);

    } catch (err) {
        // Log the error to console so you can see what happened if it fails
        console.error(err);
        res.status(500).json({error: err.message});
    }

})

// Critically important. Do not forget to delete here after development. If you leave it open, anyone can get user info by username.

router.get('/users/:username', async (req, res) => {

    try {
        const {username} = req.params;
        const user = await User.findOne({username}).select('-password')

        if (!user) {
            return res.status(404).json({error: "User not found."});
        }
        res.json(user);

    } catch (err) {
        res.status(500).json({error: err.message});

    }

})


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

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE},);

        const userObj = user.toObject(); // veya user.toJSON()
        delete userObj.password;


        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({
            msg: "Login successful", token, user: userObj
        })


    } catch (err) {
        return res.status(500).json({error: err.message});

    }

})

router.post('/logout', (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true, sameSite: 'strict',
        });
        return res.status(200).json({msg: "Logout successful"})
    } catch (err) {
        return res.status(500).json({error: err.message});
    }


})

export default router;
