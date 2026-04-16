import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import { processComplaint } from "../utils/openrouter.js";
import { sendComplaintStatusEmail, sendMail } from "../utils/mail.js";
import Notification from "../models/Notification.js";

export const createComplaint = async (req, res) => {
    try {
        // Support form-data fields: title, description, text
        const title = req.body.title;
        const description = req.body.description;
        const text = req.body.text || description || title || "";

        // If a file was uploaded (audio/photo), record its path
        let audioUrl = undefined;
        if (req.file) {
            // multer provides `path` on diskStorage in CommonJS; ensure forward slashes for URLs
            audioUrl = req.file.path ? req.file.path.replaceAll('\\', '/') : req.file.filename;
        }

        // 🤖 AI Processing (only if there is text)
        let parsedData = { category: "General", summary: text, priority: "Low" };
        if (text) {
            try {
                const aiData = await processComplaint(text);
                try {
                    parsedData = JSON.parse(aiData);
                } catch {
                    parsedData = { category: "General", summary: text, priority: "Low" };
                }
            } catch (aiErr) {
                console.error("AI processing failed:", aiErr);
            }
        }

        const complaint = await Complaint.create({
            userId: req.user?.id,
            originalText: text,
            translatedText: parsedData.summary,
            category: parsedData.category,
            priority: parsedData.priority,
            audioUrl,
        });

        // notify admins by email about new complaint
        try {
            const user = await User.findById(req.user?.id).select("name email flatNumber");
            const admins = await User.find({ role: 'admin' }).select('name email');
            const subject = `New complaint from ${user?.name || 'User'} (${user?.flatNumber || ''})`;
            const html = `
                <p>New complaint received</p>
                <p><strong>User:</strong> ${user?.name || ''} (${user?.flatNumber || ''})</p>
                <p><strong>Category:</strong> ${parsedData.category}</p>
                <p><strong>Priority:</strong> ${parsedData.priority}</p>
                <p><strong>Summary:</strong> ${parsedData.summary}</p>
            `;
            for (const admin of admins) {
                sendMail({ to: admin.email, subject, html }).catch((e) => console.error('admin complaint email error', e));
            }
        } catch (e) {
            console.error('failed to notify admins of complaint', e);
        }

        res.status(201).json(complaint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// get all complaints 
export const getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate("userId", "name email flatNumber")
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// update complaint status
export const updateComplaintStatus = async (req, res) => {
    try {
        const { status } = req.body || {};

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        complaint.status = status;
        // allow admin to provide an optional comment
        if (req.body.adminComment) complaint.adminComment = req.body.adminComment;
        await complaint.save();

        // populate user info to get email
        await complaint.populate("userId", "name email flatNumber");

        // create in-app notification
        try {
            await Notification.create({
                userId: complaint.userId._id || complaint.userId,
                type: 'complaint',
                title: `Complaint ${complaint._id} ${status}`,
                message: `${status}: ${complaint.translatedText || complaint.originalText || ''}`,
                data: { complaintId: complaint._id },
            });
        } catch (nerr) {
            console.error("Failed to create notification:", nerr);
        }

        // send email asynchronously
        sendComplaintStatusEmail(complaint.userId, complaint, req.body.adminComment).catch((e) => console.error("sendComplaintStatusEmail error", e));

        res.json({ message: "Status updated", complaint });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMyComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({
            userId: req.user.id
        }).sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch complaints" });
    }
};