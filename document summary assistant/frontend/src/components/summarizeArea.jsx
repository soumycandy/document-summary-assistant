import React, { useState } from 'react';
import axios from 'axios';

export default function SummaryView({ text }) {
  const [length, setLength] = useState('short');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  async function requestSummary() {
    setLoading(true);
    setSummary('');
    try {
      const res = await axios.post(`${backend}/api/summarize`, { text, length }, { timeout: 120000 });
      setSummary(res.data.summary);
    } catch (err) {
      setSummary('Error summarizing: ' + (err?.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{marginTop:20}}>
      <div><strong>Extracted text preview (click to expand)</strong></div>
      <textarea readOnly value={text} />
      <div className="controls" style={{marginTop:8}}>
        <label>Length:</label>
        <select value={length} onChange={e => setLength(e.target.value)}>
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
        <button className="primary" onClick={requestSummary} disabled={loading}>Generate summary</button>
        {loading && <div style={{marginLeft:8}}>Working…</div>}
      </div>

      {summary && (
        <div className="summary">
          <pre>{summary}</pre>
        </div>
      )}
    </div>
  );
}
