import User from "../models/User.js";
import Complaint from "../models/Complaint.js";
import Booking from "../models/Booking.js";
import Notification from "../models/Notification.js";
import { sendMail } from "../utils/mail.js";
import Announcement from "../models/Announcement.js";

// helper to publish an announcement (create notifications + emails)
export const publishAnnouncementById = async (announcementId) => {
    const ann = await Announcement.findById(announcementId);
    if (!ann) throw new Error('Announcement not found');
    if (ann.published) return ann;

    const users = await User.find({ role: 'user' }).select('_id name email flatNumber');

    const docs = users.map(u => ({
        userId: u._id,
        type: 'announcement',
        title: ann.title,
        message: ann.message,
        data: { announcementId: ann._id },
    }));
    await Notification.insertMany(docs);

    for (const u of users) {
        const subject = `Announcement: ${ann.title}`;
        const html = `
            <p>Namaste ${u.name || 'Resident'},</p>
            <p><strong>${ann.title}</strong></p>
            <p>${ann.message}</p>
            <p>— Panchayat Team</p>
        `;
        sendMail({ to: u.email, subject, html }).catch(e => console.error('announcement email error', e));
    }

    ann.published = true;
    ann.publishedAt = new Date();
    await ann.save();
    return ann;
};

// 📊 Dashboard Stats
export const getDashboardStats = async (req, res) => {
    try {
        // optional date filters from query params (ISO strings)
        const { startDate, endDate } = req.query || {};
        let start = startDate ? new Date(startDate) : null;
        let end = endDate ? new Date(endDate) : null;
        if (end) end.setHours(23, 59, 59, 999);

        const complaintMatch = {};
        const bookingMatch = {};
        if (start || end) {
            complaintMatch.createdAt = {};
            bookingMatch.createdAt = {};
            if (start) {
                complaintMatch.createdAt.$gte = start;
                bookingMatch.createdAt.$gte = start;
            }
            if (end) {
                complaintMatch.createdAt.$lte = end;
                bookingMatch.createdAt.$lte = end;
            }
        }

        const totalUsers = await User.countDocuments();

        const totalComplaints = await Complaint.countDocuments(complaintMatch);
        const pendingComplaints = await Complaint.countDocuments({ ...complaintMatch, status: "pending" });
        const resolvedComplaints = await Complaint.countDocuments({ ...complaintMatch, status: "resolved" });
        const resolvedPercent = totalComplaints ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;
        const pendingPercent = totalComplaints ? Math.round((pendingComplaints / totalComplaints) * 100) : 0;

        const totalBookings = await Booking.countDocuments(bookingMatch);
        const pendingBookings = await Booking.countDocuments({ ...bookingMatch, status: "pending" });

        const recentComplaints = await Complaint.find().sort({ createdAt: -1 }).limit(5);
        const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);

        // service usage: count bookings per service (filtered by createdAt if provided)
        const matchStage = Object.keys(bookingMatch).length ? [{ $match: bookingMatch }] : [];
        const serviceUsageAgg = await Booking.aggregate([
            ...matchStage,
            { $group: { _id: "$service", count: { $sum: 1 } } },
            { $lookup: { from: "services", localField: "_id", foreignField: "_id", as: "service" } },
            { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
            { $project: { serviceName: "$service.name", count: 1 } },
            { $sort: { count: -1 } }
        ]);

        const serviceUsage = serviceUsageAgg.map(s => ({ name: s.serviceName || 'Unknown', count: s.count }));

        // complaint category breakdown
        const catMatchStage = Object.keys(complaintMatch).length ? [{ $match: complaintMatch }] : [];
        const categoryAgg = await Complaint.aggregate([
            ...catMatchStage,
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const categoryBreakdown = categoryAgg.map(c => ({ category: c._id || 'Uncategorized', count: c.count }));

        // monthly time series for complaints (year-month)
        const monthlyAgg = await Complaint.aggregate([
            ...catMatchStage,
            { $project: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } } },
            { $group: { _id: { year: "$year", month: "$month" }, count: { $sum: 1 } } },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        const monthlySeries = monthlyAgg.map(m => ({ year: m._id.year, month: m._id.month, count: m.count }));

        res.json({
            totalUsers,
            totalComplaints,
            pendingComplaints,
            resolvedComplaints,
            resolvedPercent,
            pendingPercent,
            totalBookings,
            pendingBookings,
            recentComplaints,
            recentBookings,
            serviceUsage,
            categoryBreakdown,
            monthlySeries,
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🧑‍💼 Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("name email flatNumber role createdAt").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Admin: create an announcement for all users (in-app + email)
export const createAnnouncement = async (req, res) => {
    try {
        const { title, message, scheduledAt } = req.body || {};
        if (!title || !message) return res.status(400).json({ message: "title and message required" });

        const announcement = await Announcement.create({
            title,
            message,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
            createdBy: req.user?.id,
            published: false,
        });

        // if no schedule or scheduledAt in the past, publish immediately
        if (!announcement.scheduledAt || announcement.scheduledAt <= new Date()) {
            await publishAnnouncementById(announcement._id);
        }

        res.json({ message: 'Announcement saved', announcement });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// List announcements (history)
export const listAnnouncements = async (req, res) => {
    try {
        const anns = await Announcement.find().sort({ createdAt: -1 });
        res.json(anns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
    try {
        const ann = await Announcement.findById(req.params.id);
        if (!ann) return res.status(404).json({ message: 'Announcement not found' });
        await ann.remove();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Publish announcement immediately
export const publishAnnouncement = async (req, res) => {
    try {
        const ann = await publishAnnouncementById(req.params.id);
        res.json({ message: 'Published', announcement: ann });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};