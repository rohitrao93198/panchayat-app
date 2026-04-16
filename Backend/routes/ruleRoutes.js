import express from "express";
import { uploadRulePdf } from "../controllers/ruleController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import { uploadPdf } from "../middleware/uploadPdf.js";

const router = express.Router();

router.post("/upload", protect, isAdmin, uploadPdf.single("file"), uploadRulePdf);

export default router;