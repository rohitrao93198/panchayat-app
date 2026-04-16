import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import ruleRoutes from './routes/ruleRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { publishAnnouncementById } from './controllers/adminController.js';
import Announcement from './models/Announcement.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://your-frontend.vercel.app"
    ],
    credentials: true
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
    res.send("Panchayat API is running");
});
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Background publisher: publish scheduled announcements every minute
setInterval(async () => {
    try {
        const now = new Date();
        const toPublish = await Announcement.find({ published: false, scheduledAt: { $lte: now } });
        for (const a of toPublish) {
            try {
                await publishAnnouncementById(a._id);
            } catch (e) {
                console.error('Failed to publish scheduled announcement', a._id, e.message || e);
            }
        }
    } catch (e) {
        // log and continue
        console.error('Announcement scheduler error', e.message || e);
    }
}, 60 * 1000);
app.use('/api/notifications', notificationRoutes);

export default app;