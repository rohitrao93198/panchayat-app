import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema({
    title: String,
    content: String,
    filePath: String,
    parseError: String,
}, { timestamps: true });

const Rule = mongoose.model("Rule", ruleSchema);
export default Rule;