import React, { useRef, useState } from 'react';
import axios from 'axios';
import Tesseract from 'tesseract.js';

export default function UploadArea({ onExtractedText }) {
  const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  async function handleFile(file) {
    setFileName(file.name);
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // upload to backend to extract PDF text
      setLoading(true);
      const form = new FormData();
      form.append('file', file);
      try {
        const res = await axios.post(`${backend}/api/extract-pdf`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onExtractedText(res.data.text);
      } catch (err) {
        alert('PDF extraction failed: ' + (err?.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    } else if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|bmp|tiff)$/i.test(file.name)) {
      // perform OCR in browser with tesseract
      setLoading(true);
      try {
        const { data } = await Tesseract.recognize(file, 'eng', { logger: m => {/*console.log(m)*/} });
        onExtractedText(data.text);
      } catch (err) {
        alert('OCR failed: ' + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Unsupported file. Use PDF or an image (jpg/png).');
    }
  }

  function onFileChange(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
  }

  async function handleTextPaste() {
    const txt = prompt('Paste the text here (or type) :');
    if (txt) onExtractedText(txt);
  }

  return (
    <div>
      <div className={`upload ${loading ? 'loading' : ''}`} onClick={() => fileRef.current.click()}>
        <input ref={fileRef} type="file" style={{display:'none'}} onChange={onFileChange} />
        <div>
          <strong>Click to upload</strong> (PDF or image) or drag-and-drop (click to choose).
        </div>
        <div className="file-info">{fileName || 'No file selected'}</div>
      </div>
      <div className="controls">
        <button className="primary" onClick={handleTextPaste}>Or paste text</button>
      </div>
    </div>
  );
}
