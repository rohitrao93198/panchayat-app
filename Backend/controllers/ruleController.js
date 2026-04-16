import fs from "fs";
import pdfParse from "pdf-parse";
import Rule from "../models/Rule.js";

export const uploadRulePdf = async (req, res) => {
    try {
        const filePath = req.file.path;

        const dataBuffer = fs.readFileSync(filePath);

        let text = "";
        try {
            const pdfData = await pdfParse(dataBuffer);
            text = pdfData.text || "";
        } catch (parseError) {
            console.error("PDF PARSE ERROR:", parseError);

            // Attempt fallback using `pdf2json` if available
            try {
                const pdf2jsonModule = await import('pdf2json');
                const PDFParser = pdf2jsonModule.default || pdf2jsonModule;

                const fallbackText = await new Promise((resolve, reject) => {
                    try {
                        const pdfParser = new PDFParser();
                        pdfParser.on('pdfParser_dataError', err => reject(err.parserError || err));
                        pdfParser.on('pdfParser_dataReady', pdfData => {
                            let ft = '';
                            const pages = (pdfData.formImage && pdfData.formImage.Pages) || [];
                            pages.forEach(page => {
                                (page.Texts || []).forEach(t => {
                                    (t.R || []).forEach(r => {
                                        ft += decodeURIComponent(r.T || '');
                                    });
                                    ft += ' ';
                                });
                                ft += '\n';
                            });
                            resolve(ft);
                        });
                        pdfParser.loadPDF(filePath);
                    } catch (e) {
                        reject(e);
                    }
                });

                // Save record with fallback text
                await Rule.create({
                    title: req.file.originalname,
                    content: fallbackText,
                    filePath: filePath,
                    parseError: 'fallback: pdf2json success',
                });

                return res.json({ message: 'PDF uploaded & processed (fallback used)', savedFile: filePath });
            } catch (fbErr) {
                console.error('Fallback parser failed:', fbErr);

                // Save record with filePath and original parseError for later inspection
                await Rule.create({
                    title: req.file.originalname,
                    content: "",
                    filePath: filePath,
                    parseError: parseError && parseError.message ? parseError.message : String(parseError),
                });

                let details = parseError && parseError.message ? parseError.message : String(parseError);
                const fbMsg = fbErr && fbErr.message ? fbErr.message : String(fbErr);
                if (fbMsg.includes('Cannot find module') || fbMsg.includes('ERR_MODULE_NOT_FOUND')) {
                    details += ' | fallback parser `pdf2json` not installed. Run `npm i pdf2json` to enable fallback parsing.';
                } else {
                    details += ' | fallback error: ' + fbMsg;
                }

                return res.status(400).json({
                    error: "PDF parsing failed. File saved but text extraction failed. The PDF may be corrupted or in an unsupported format.",
                    details,
                    savedFile: filePath,
                });
            }
        }

        await Rule.create({
            title: req.file.originalname,
            content: text,
            filePath: filePath,
            parseError: null,
        });

        res.json({ message: "PDF uploaded & processed", savedFile: filePath });

    } catch (error) {
        console.log("PDF ERROR:", error);
        res.status(500).json({ error: "PDF processing failed" });
    }
};