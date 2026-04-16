import express from "express";
import { getMyNotifications, markAsRead, getUnreadCount } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.patch("/:id/read", protect, markAsRead);
router.get("/unread-count", protect, getUnreadCount);

export default router;
