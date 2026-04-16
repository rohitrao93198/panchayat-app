import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { sendBookingStatusEmail, sendMail } from "../utils/mail.js";
import Notification from "../models/Notification.js";

// 📅 Create Booking
export const createBooking = async (req, res) => {
    try {
        const booking = await Booking.create({
            user: req.user.id,
            service: req.body.serviceId,
            date: req.body.date,
            time: req.body.time
        });

        // populate user and service for email
        await booking.populate('user service');

        // notify admins by email about new booking
        try {
            const admins = await User.find({ role: 'admin' }).select('name email');
            const subject = `New booking from ${booking.user?.name || 'User'} (${booking.user?.flatNumber || ''})`;
            const html = `
                <p>New booking received</p>
                <p><strong>User:</strong> ${booking.user?.name || ''} (${booking.user?.flatNumber || ''})</p>
                <p><strong>Service:</strong> ${booking.service?.name || ''}</p>
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Time:</strong> ${booking.time}</p>
            `;
            for (const admin of admins) {
                sendMail({ to: admin.email, subject, html }).catch((e) => console.error('admin booking email error', e));
            }
        } catch (e) {
            console.error('failed to notify admins of booking', e);
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📋 Get My Bookings
export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate("service");

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🧑‍💼 Admin: Get all bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate("service user").sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🧑‍💼 Admin: Update Booking Status
export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: "Status is required" });

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        booking.status = status;
        await booking.save();

        // populate for email
        await booking.populate("user service");

        // create in-app notification
        try {
            await Notification.create({
                userId: booking.user._id || booking.user,
                type: 'booking',
                title: `Booking ${booking._id} ${status}`,
                message: `${status}: ${booking.service?.name || ''} on ${booking.date} ${booking.time}`,
                data: { bookingId: booking._id },
            });
        } catch (nerr) {
            console.error("Failed to create booking notification:", nerr);
        }

        // send booking status email asynchronously
        sendBookingStatusEmail(booking.user, booking).catch((e) => console.error("sendBookingStatusEmail error", e));

        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};