// javascript
// api/routes/users.js
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/me', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication not found.' });
        }

        const user = await User.findById(userId)
            .select('-password')
            .populate('joinedSubcommunities', 'nameKey displayName iconImg');
        if (!user) {
            return res.status(404).json({ error: 'Could not find user with ID.' });
        }

        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

router.get('/user/:username', async (req, res) => {
    const { username } = req.params;
    try{
        const user=await User.findOne({username})
            .select("username displayName profilePic about karma createdAt");
        if (!user) {
            return res.status(404).json({error: "Could not find user with this username."});
        }
        res.status(200).json(user);
        
    }catch (err) {
        res.status(500).json({ error: err.message });

    }
})

// Save/Unsave Post
router.put("/save/:postId", async (req, res) => {
    const userId = req.user.id;
    const { postId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const index = user.savedPosts.indexOf(postId);
        let isSaved;

        if (index === -1) {
            user.savedPosts.push(postId);
            isSaved = true;
        } else {
            user.savedPosts.splice(index, 1);
            isSaved = false;
        }

        await user.save();
        res.status(200).json({ isSaved, savedPosts: user.savedPosts });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User Profile
router.put("/update", async (req, res) => {
    const userId = req.user.id;
    const { username, displayName, about, email, profilePic } = req.body;

    try {
        // Check if username or email already exists (if changed)
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) return res.status(400).json({ error: "Username already taken." });
        }
        if (email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
            if (existingEmail) return res.status(400).json({ error: "Email already in use." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    ...(username && { username }),
                    ...(displayName && { displayName }),
                    ...(about && { about }),
                    ...(email && { email }),
                    ...(profilePic && { profilePic })
                }
            },
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
