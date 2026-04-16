import fs from "fs";
import axios from "axios";

export const speechToText = async (filePath) => {
    try {
        const audio = fs.readFileSync(filePath);

        const response = await axios.post(
            "https://api.deepgram.com/v1/listen",
            audio,
            {
                headers: {
                    Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
                    "Content-Type": "audio/webm"
                }
            }
        );

        const text =
            response.data?.results?.channels[0]?.alternatives[0]?.transcript;

        return text || "";
    } catch (err) {
        console.error("Deepgram error:", err.message);
        return "";
    }
};