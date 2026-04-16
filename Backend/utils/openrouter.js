import axios from "axios";

export const processComplaint = async (text) => {
    try {
        const prompt = `
Convert this complaint into JSON:
{
  category: "",
  summary: "",
  priority: ""
}

Complaint: ${text}
`;

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error(error);
        return null;
    }
};