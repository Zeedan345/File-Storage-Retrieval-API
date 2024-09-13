const express = require('express');
const multer = require('multer');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 8005;

//app.use(express.json());

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const ZIPS_PATH = path.join(__dirname, 'zips');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create a directory for each upload using the uploadId
        const uploadDir = path.join(UPLOADS_DIR, req.uploadId);
        
        // Check if the directory exists, if not create it
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix);
    }
});

const upload = multer({storage : storage});

app.use('/upload', (req, res, next) => {
    req.uploadId = uuidv4();
    next();
});

app.post('/upload', upload.array('files', 20),(req, res) => {
    if(!req.files || req.files.length === 0) {
        return res.status(400).json({message: 'No file was uploaded'});
    }

    const uploadId = req.uploadId;

    res.status(200).json({uploadId: uploadId });
});
app.get('/download/:id', async (req, res) => {
    const uploadId = req.params.id;
    const uploadPath = path.join(UPLOADS_DIR, uploadId);

    if (!fs.existsSync(uploadPath)) {
        return res.status(400).json({ message: 'No file with that ID exists' });
    }

    const zipFileName = `file_${uploadId}.zip`;
    const zipFilePath = path.join(ZIPS_PATH, zipFileName);
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.log(`Created zip: ${zipFileName} (${archive.pointer()} total bytes)`);

        res.download(zipFilePath, zipFileName, (err) => {
            if (err) {
                console.error(err);
                res.status(500).json('Error downloading the file.');
            }
        });
    });

    archive.on('error', (err) => {
        console.error('Archiver error:', err);
        res.status(500).json('Error creating zip file.');
    });

    archive.pipe(output);

    archive.directory(uploadPath, false);

    archive.finalize();
});


app.listen(
    PORT,
    () => console.log(`Live on http://localhost:${PORT}`)
);


