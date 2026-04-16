import express from "express";
import {
    createComplaint,
    getAllComplaints,
    getMyComplaints,
    updateComplaintStatus,
} from "../controllers/complaintController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// 👤 User
router.post("/", protect, upload.single("file"), createComplaint);
router.get("/my", protect, getMyComplaints);

// 🧑‍💼 Admin
router.get("/", protect, isAdmin, getAllComplaints);
router.patch("/:id", protect, isAdmin, updateComplaintStatus);

export default router;