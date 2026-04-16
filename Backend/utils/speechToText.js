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

        // If still no transcript, attempt language-specific retries (Hindi then English)
        if (!text) {
            const tryLangs = ['hi', 'en'];
            for (const lang of tryLangs) {
                try {
                    console.debug(`Retrying Deepgram with language=${lang} (raw)`);
                    const rawRes = await axios.post(`https://api.deepgram.com/v1/listen?language=${lang}`, audio, {
                        headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`, 'Content-Type': contentType },
                        timeout: 120000,
                    });
                    text = rawRes?.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
                    if (text) {
                        console.debug(`Deepgram raw retry succeeded for language=${lang}`);
                        break;
                    }
                } catch (errLang) {
                    console.debug(`Deepgram raw retry failed for language=${lang}`, errLang?.message || errLang);
                }

                try {
                    console.debug(`Retrying Deepgram with language=${lang} (form-data)`);
                    const form2 = new FormData();
                    form2.append('file', fs.createReadStream(filePath));
                    const headers2 = { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`, ...form2.getHeaders() };
                    const fmRes2 = await axios.post(`https://api.deepgram.com/v1/listen?language=${lang}`, form2, { headers: headers2, timeout: 120000 });
                    text = fmRes2?.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
                    if (text) {
                        console.debug(`Deepgram form-data retry succeeded for language=${lang}`);
                        break;
                    }
                } catch (fmErr2) {
                    console.debug(`Deepgram form-data retry failed for language=${lang}`, fmErr2?.message || fmErr2);
                }
            }
        }

        return text || "";
    } catch (err) {
        console.error("Deepgram error:", err?.message || err);
        return "";
    }
};