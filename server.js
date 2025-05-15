const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/analyze', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const metadata = await mm.parseFile(req.file.path);
        const bpm = metadata.common.bpm || null;
        fs.unlinkSync(req.file.path);
        if (bpm) {
            res.json({ bpm });
        } else {
            res.status(422).json({ error: 'Could not detect BPM from file metadata' });
        }
    } catch (err) {
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Error processing file' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});