import User from "../models/User.js";

export const isAdmin = async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (user && user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Admin only" });
    }
};