import Rule from "../models/Rule.js";
import axios from "axios";

export const askQuestion = async (req, res) => {
    try {
        const { question } = req.body;

        // get all rules from database
        const rules = await Rule.find();

        const ruleText = rules.map(r => r.content).join("\n");

        // AI prompt
        const prompt = `
You are a strict AI assistant for a society rulebook.

RULEBOOK:
${ruleText}

USER QUESTION:
${question}

STRICT INSTRUCTIONS:
- Answer ONLY using the rulebook
- DO NOT ask any questions
- DO NOT detect language
- DO NOT ask for clarification
- Reply directly with the answer
- If not found, say: "Not mentioned in rulebook"
- Keep answer short (1 line)
- Reply in same language as question
`;

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "meta-llama/llama-3-8b-instruct",
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.2
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const answer = response.data.choices[0].message.content;

        res.json({ answer });
    } catch (error) {
        console.log("Chatbot Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Chatbot failed" });
    }
}