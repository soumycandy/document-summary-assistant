# Document Summary Assistant

A small app that extracts text from PDFs and images (OCR), then generates short/medium/long summaries. Built with React (Vite) frontend and Node/Express backend. Supports OpenAI LLM summarization (optional) with fallback extractive summarizer.

## Features
- PDF parsing (backend) using `pdf-parse`
- In-browser OCR for images using `tesseract.js`
- Summaries in three lengths (short/medium/long)
- Loading states, basic error handling
- Deployable: frontend (Vercel/Netlify), backend (Render/Heroku)


