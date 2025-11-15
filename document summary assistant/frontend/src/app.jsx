import React, { useState } from 'react';
import UploadArea from './components/uploadArea';
import SummaryView from './components/SummaryView';

export default function App(){
  const [text, setText] = useState('');
  return (
    <div className="container">
      <h1>Document Summary Assistant</h1>
      <p>Upload a PDF or image (OCR in-browser) or paste text. Then generate short/medium/long summaries.</p>
      <UploadArea onExtractedText={(t)=>setText(t)} />
      {text ? <SummaryView text={text} /> : <div style={{marginTop:12}}>No text loaded yet.</div>}
      <hr style={{marginTop:20}} />
      <small>Notes: OCR runs in browser with Tesseract. PDFs are sent to backend for parsing.</small>
    </div>
  );
}
