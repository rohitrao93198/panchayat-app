import Notification from "../models/Notification.js";

// Get notifications for current user
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
    try {
        const notif = await Notification.findOne({ _id: req.params.id, userId: req.user.id });
        if (!notif) return res.status(404).json({ message: "Notification not found" });
        notif.read = true;
        await notif.save();
        res.json(notif);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Unread count
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user.id, read: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
