import express from "express";
import Subcommunity from "../models/Subcommunity.js";
import User from "../models/User.js"; // Importing User model to check existence

const router = express.Router();

// ../api/Subs
router.get("/get/:id", async (req, res) => {

    try{

        const {id} = req.params;

        const subcommunity = await Subcommunity.findById(id);

        if(!subcommunity){
            return res.status(404).json({ error: "Subcommunity not found." });
        }

        res.status(200).json(subcommunity);


    }catch(err){
        res.status(500).json({ error: err.message });
    }

})


router.post("/create", async (req, res) => {
    // 1. Get data
    const { nameKey, displayName, description, bannerImg, iconImg } = req.body;
    const userId = req.user?.id; // Assumed from middleware

    try {
        // --- Validation Steps ---
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized." });
        }
        if (!nameKey || !displayName) {
            return res.status(400).json({ error: "Name and Display Name are required." });
        }

        const normalizedNameKey = nameKey.trim().toLowerCase();

        // Regex: Only allow letters, numbers, underscore (no spaces)
        if (!/^[a-z0-9_]+$/.test(normalizedNameKey)) {
            return res.status(400).json({ error: "Community URL name can only contain letters, numbers, and underscores." });
        }

        const existingSub = await Subcommunity.findOne({ nameKey: normalizedNameKey });
        if (existingSub) {
            return res.status(409).json({ error: "Subcommunity already exists." });
        }

        // --- 2. Create the Subcommunity Document ---
        const newSubcommunity = new Subcommunity({
            nameKey: normalizedNameKey,
            displayName: displayName.trim(),
            description,
            bannerImg,
            iconImg,
            owner: userId,
            admin: [userId],   // Logic: Creator is in the admin list
            members: [userId], // Logic: Creator is a member
        });

        const savedSubcommunity = await newSubcommunity.save();

        // --- 3. Update the User Document ---
        // We use $push to add to both arrays simultaneously
        await User.findByIdAndUpdate(userId, {
            $addToSet: {
                joinedSubcommunities: savedSubcommunity._id
            },
            $push: {
                authorities: {
                    subcommunity: savedSubcommunity._id,
                    role: "owner" // Explicitly setting the role
                }
            }
        });

        res.status(201).json(savedSubcommunity);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


router.get("/get-by-name/:nameKey", async (req, res) => {
    try {
        const { nameKey } = req.params;
        const userId = req.user?.id;

        const subcommunity = await Subcommunity.findOne({ nameKey });

        if (!subcommunity) {
            return res.status(404).json({ error: "Subcommunity not found." });
        }

        let isMember = false;
        if (userId) {
            isMember = subcommunity.members.some(m => m.toString() === userId);
        }

        const result = { ...subcommunity.toObject(), isMember };
        res.status(200).json(result);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/join/:nameKey", async (req, res) => {
    try {
        const { nameKey } = req.params;
        const userId = req.user.id;

        const sub = await Subcommunity.findOne({ nameKey });
        if (!sub) return res.status(404).json({ error: "Subcommunity not found." });

        const isMember = sub.members.some((memberId) => memberId.toString() === userId);

        if (isMember) {
            return res.status(400).json({ error: "You're already a member." });
        }

        await Subcommunity.findByIdAndUpdate(sub._id, { $addToSet: { members: userId } });
        await User.findByIdAndUpdate(userId, { $addToSet: { joinedSubcommunities: sub._id } });

        res.status(200).json({ message: "Joined community", isMember: true });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post("/leave/:nameKey", async (req, res) => {
    try {
        const { nameKey } = req.params;
        const userId = req.user.id;

        const sub = await Subcommunity.findOne({ nameKey });
        if (!sub) return res.status(404).json({ error: "Subcommunity not found." });

        const isMember = sub.members.some((memberId) => memberId.toString() === userId);
        const isAdmin = sub.admin.some((admins) => admins.toString() === userId);

        if (!isMember) {
            return res.status(400).json({ error: "You're not a member." });
        }


        // GÜVENLİK EKLENDİ: Sahip çıkamaz
        if (sub.owner.toString() === userId) {
            return res.status(400).json({ error: "The owner cannot leave the community." });
        }



        await Subcommunity.findByIdAndUpdate(sub._id, { $pull: { members: userId } });
        await User.findByIdAndUpdate(userId, { $pull: { joinedSubcommunities: sub._id } });
        if (isAdmin) {
            await Subcommunity.findByIdAndUpdate(sub._id, { $pull: { admin: userId } });
        }

        res.status(200).json({ message: "Left community", isMember: false });


    }catch (err) {
        res.status(400).json({ error: err.message });
    }
})

router.get("/:nameKey", async (req, res) => {
    try{
        const { nameKey } = req.params;
        const userId = req.user.id;

        const sub= await Subcommunity.findOne({nameKey})
        if (!sub) {
            return res.status(404).json({ error: "Subcommunity not found." });
        }
        const isMember = sub.members.some((memberId) => memberId.toString() === userId);
        if (isMember) {
            res.status(200).json({ isMember: true });
        }else{
            res.status(200).json({ isMember: false });
        }

    }catch (err){
        res.status(400).json({ error: err.message });
    }
})



export default router;

