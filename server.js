const express = require('express');
const multer = require('multer');
const mm = require('music-metadata');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    const filePath = path.resolve(req.file.path);
    const metadata = await mm.parseFile(filePath);
    fs.unlinkSync(filePath); // cleanup
    const bpm = metadata.common.bpm || null;

    if (bpm) {
      res.json({ bpm });
    } else {
      res.json({ error: 'BPM not found in metadata.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze file.' });
  }
});

const PORT = process.env.PORT || 3000; // ← 🔥 this line is the key
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
