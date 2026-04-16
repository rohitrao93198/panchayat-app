import express from "express";
import { addService, getServices } from "../controllers/serviceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addService); // admin
router.get("/", getServices);

export default router;