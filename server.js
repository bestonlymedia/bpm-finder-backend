const express = require('express');
const multer = require('multer');
const mm = require('music-metadata');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/analyze', upload.single('file'), async (req, res) => {
  if (!req.file) {
    console.error('No file uploaded.');
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = path.join(__dirname, req.file.path);
  console.log(`Received file: ${filePath}`);

  try {
    const metadata = await mm.parseFile(filePath);
    const duration = metadata.format.duration;

    if (!duration || duration <= 0) {
      throw new Error('Invalid duration');
    }

    let beats = 0;
    let bpm = null;

    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) {
        console.error('ffprobe error:', err);
        return res.status(500).json({ error: 'Could not analyze audio file' });
      }

      // Simulated BPM calc (replace with real BPM extraction logic if needed)
      bpm = Math.floor(Math.random() * (160 - 60 + 1)) + 60;
      console.log(`Calculated BPM: ${bpm}`);

      fs.unlink(filePath, () => {});
      return res.json({ bpm });
    });
  } catch (error) {
    console.error('Processing error:', error);
    fs.unlink(filePath, () => {});
    res.status(500).json({ error: 'Error processing file' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
