import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { createAnnouncement, listAnnouncements, deleteAnnouncement, publishAnnouncement, getAllUsers } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// 🔥 Admin Dashboard (Protected + Admin only)
router.get("/dashboard", protect, isAdmin, getDashboardStats);

// 📢 Post announcement to all users
router.post("/announce", protect, isAdmin, createAnnouncement);

// 📢 Create announcement (can be scheduled)
router.post("/announce", protect, isAdmin, createAnnouncement);

// 📜 Announcement history
router.get("/announcements", protect, isAdmin, listAnnouncements);

// 🗑 Delete announcement
router.delete("/announcements/:id", protect, isAdmin, deleteAnnouncement);

// ▶️ Publish now
router.post("/announcements/:id/publish", protect, isAdmin, publishAnnouncement);

// 👥 List Users (Admin only)
router.get("/users", protect, isAdmin, getAllUsers);

export default router;