// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { openaiSummarize, fallbackSummarize } = require('./summarizer');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => res.send('Document Summary Assistant Backend'));

// PDF upload and extract text
app.post('/api/extract-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    // clean up file
    fs.unlinkSync(req.file.path);
    res.json({ text: data.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Summarize text (from frontend: OCR result or PDF-extracted text)
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, length } = req.body;
    if (!text || text.trim().length === 0) return res.status(400).json({ error: 'No text to summarize' });
    const openaiKey = process.env.OPENAI_API_KEY || null;
    let result;
    if (openaiKey) {
      try {
        result = await openaiSummarize(text, length || 'short', openaiKey);
        return res.json({ summary: result, source: 'openai' });
      } catch (err) {
        console.warn('OpenAI failed, falling back:', err.message);
        // continue to fallback
      }
    }
    // fallback
    result = fallbackSummarize(text, length || 'short');
    res.json({ summary: result, source: 'fallback' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
