import express from "express";
import {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateBookingStatus
} from "../controllers/bookingController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/", protect, isAdmin, getAllBookings); // admin view (frontend requests /api/bookings)
router.patch("/:id", protect, updateBookingStatus); // admin

export default router;