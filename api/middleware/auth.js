import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ msg: 'Yetkilendirme tokeni eksik' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Geçersiz token' });
    }
};

export default auth;
