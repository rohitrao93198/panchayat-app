import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        audioUrl: String,
        originalText: String,
        translatedText: String,
        category: String,
        priority: String,
        status: {
            type: String,
            default: "pending",
        },
    },
    { timestamps: true }
);

const Complaint = mongoose.model("Complaint", complaintSchema);
export default Complaint;

