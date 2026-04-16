import fs from "fs";
import axios from "axios";
import path from "path";

const extToMime = (ext) => {
    switch (ext.toLowerCase()) {
        case '.webm': return 'audio/webm';
        case '.mp4':
        case '.m4a': return 'audio/mp4';
        case '.mp3': return 'audio/mpeg';
        case '.wav': return 'audio/wav';
        default: return 'application/octet-stream';
    }
};

export const speechToText = async (filePath) => {
    try {
        const audio = fs.readFileSync(filePath);
        const ext = path.extname(filePath) || '';
        const contentType = extToMime(ext);

        const response = await axios.post(
            "https://api.deepgram.com/v1/listen",
            audio,
            {
                headers: {
                    Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
                    "Content-Type": contentType
                }
            }
        );

        const text = response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

        return text || "";
    } catch (err) {
        console.error("Deepgram error:", err?.message || err);
        return "";
    }
};