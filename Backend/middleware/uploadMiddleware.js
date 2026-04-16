import multer from 'multer';
import path from 'path';
import fs from 'fs';

const audioUploadPath = 'uploads/audio';

// ensure upload folder exists
if (!fs.existsSync(audioUploadPath)) {
    fs.mkdirSync(audioUploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, audioUploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });
export default upload;