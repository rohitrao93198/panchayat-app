import fs from "fs";
import axios from "axios";
import path from "path";
import FormData from "form-data";

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

        // Try sending raw binary first
        let response;
        try {
            response = await axios.post(
                "https://api.deepgram.com/v1/listen",
                audio,
                {
                    headers: {
                        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
                        "Content-Type": contentType,
                    },
                    timeout: 120000,
                }
            );
        } catch (rawErr) {
            console.debug('Deepgram raw upload failed, will try form-data fallback', rawErr?.message || rawErr);
            response = null;
        }

        let text = response?.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

        // If no transcript obtained, retry using multipart/form-data (more compatible with some encodings/headers)
        if (!text) {
            try {
                const form = new FormData();
                form.append('file', fs.createReadStream(filePath));

                const headers = { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`, ...form.getHeaders() };

                const fmRes = await axios.post('https://api.deepgram.com/v1/listen', form, { headers, timeout: 120000 });
                text = fmRes?.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
                if (text) console.debug('Deepgram form-data fallback succeeded');
            } catch (fmErr) {
                console.error('Deepgram form-data fallback failed', fmErr?.message || fmErr);
            }
        }

        return text || "";
    } catch (err) {
        console.error("Deepgram error:", err?.message || err);
        return "";
    }
};