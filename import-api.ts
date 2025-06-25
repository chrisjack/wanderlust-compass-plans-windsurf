
import express from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Setup
const app = express();
dotenv.config();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:54037',
    'http://127.0.0.1:54037',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
  ],
  credentials: true,
}));
const upload = multer({ dest: 'uploads/' });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Field definitions
const fields: Record<string, string[]> = {
  flights: [
    'Airline', 'Flight number', 'Departure city', 'Departure date', 'Departure time',
    'Departure Terminal', 'Arrival city', 'Arrival date', 'Arrival time', 'Arrival Terminal'
  ],
  accommodation: [
    'Name', 'Address', 'Arrival date', 'Departure date', 'Check-in time',
    'Check-out time', 'Confirmation/booking number'
  ],
  event: [
    'Name', 'Address', 'Start date', 'Start time', 'Confirmation/booking number'
  ],
  transport: [
    'Provider', 'Reservation number', 'Start date', 'Start time', 'Pick-up location', 'Arrival location'
  ],
  cruise: [
    'Start date', 'End date', 'Confirmation/booking number', 'Cruise line', 'Ship name', 'Cruise name', 'Boarding time', 'Departure date', 'Departure port', 'Arrival port', 'Arrival date'
  ]
};

// Health check route
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Main import route
app.post('/api/import', upload.single('file'), async (req, res) => {
  const { travelArea } = req.body;
  const file = req.file;
  console.log('[IMPORT DEBUG] Received file:', file ? file.originalname : 'none', 'type:', file ? file.mimetype : 'none');

  if (!file) {
    console.error('[IMPORT ERROR] No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  if (!fields[travelArea]) {
    console.error('[IMPORT ERROR] Invalid travel area:', travelArea);
    return res.status(400).json({ error: 'Invalid travel area', travelArea });
  }

  let extractedText = '';
  try {
    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const pdfType = 'application/pdf';
    if (imageTypes.includes(file.mimetype)) {
      // Use Tesseract.js for image OCR
      extractedText = (await Tesseract.recognize(file.path, 'eng')).data.text;
    } else if (file.mimetype === pdfType) {
      // Use pdf-parse for PDF text extraction (dynamic import workaround for ESM bug)
      const pdfParse = (await import('pdf-parse')).default;
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (file.mimetype === 'text/plain') {
      // For text files, read directly
      extractedText = fs.readFileSync(file.path, 'utf8');
    } else {
      throw new Error('Unsupported file type. Please upload an image, PDF, or text file.');
    }
  } catch (err: any) {
    console.error('[IMPORT ERROR] OCR/Text extraction failed:', err, err?.stack);
    return res.status(500).json({ error: 'OCR/Text extraction failed', details: err.message });
  } finally {
    // Clean up uploaded file
    fs.unlink(file.path, () => {});
  }

  // Compose prompt for OpenAI
  const prompt = `Extract the following fields from the travel confirmation text below. If a field is missing, return null for that field. Output the result as a JSON object with the exact field names.\n\nFields:\n${fields[travelArea].map(f => `- ${f}`).join('\n')}\n\nTravel confirmation text:\n"""\n${extractedText}\n"""`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });
    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      console.error('[IMPORT ERROR] LLM responseText is null or undefined:', responseText);
      return res.status(500).json({ error: 'LLM responseText is null or undefined', details: responseText });
    }
    const jsonStart = responseText.indexOf('{');
    const jsonEnd = responseText.lastIndexOf('}');
    let parsed = null;
    if (jsonStart !== -1 && jsonEnd !== -1) {
      parsed = JSON.parse(responseText.slice(jsonStart, jsonEnd + 1));
    } else {
      console.error('[IMPORT ERROR] No JSON object found in LLM response:', responseText);
      return res.status(500).json({ error: 'No JSON object found in LLM response', details: responseText });
    }
    res.json(parsed);
  } catch (error: any) {
    console.error('[IMPORT ERROR] LLM extraction failed:', error, error?.stack);
    res.status(500).json({ error: 'LLM extraction failed', details: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Import API running on port ${PORT}`);
});