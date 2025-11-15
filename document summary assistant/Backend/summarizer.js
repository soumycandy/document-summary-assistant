// summarizer.js
const fetch = require('node-fetch');

async function openaiSummarize(text, length, openaiKey) {
  // length: 'short'|'medium'|'long'
  const maxTokens = length === 'short' ? 100 : length === 'medium' ? 250 : 500;
  const prompt = `Summarize the following text into a ${length} summary and provide 5 key bullet points.\n\nText:\n${text}\n\nFormat:\nSummary:\n- <summary>\nKey points:\n- point1\n- point2\n- point3\n- point4\n- point5\n`;
  const url = 'https://api.openai.com/v1/chat/completions';
  const body = {
    model: "gpt-4o-mini", // replace if desired
    messages: [{ role: "user", content: prompt }],
    max_tokens: Math.min(maxTokens, 1000),
    temperature: 0.2
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${txt}`);
  }
  const j = await res.json();
  const content = j.choices?.[0]?.message?.content ?? '';
  return content;
}

// Fallback extractive summarizer: score sentences by word frequency
function fallbackSummarize(text, length) {
  // split into sentences
  const sentences = text
    .replace(/\s+/g, ' ')
    .match(/[^\.!\?]+[\.!\?]+/g) || [text];

  // build word frequency map
  const stopwords = new Set([
    'the','and','is','in','to','of','a','for','on','with','as','that','this','it','are','was','be','by','an','or','from','at','which'
  ]);
  const freq = {};
  const words = text.toLowerCase().match(/\w+/g) || [];
  words.forEach(w => {
    if (stopwords.has(w) || w.length < 2) return;
    freq[w] = (freq[w] || 0) + 1;
  });

  // score sentences
  const scored = sentences.map(s => {
    const ws = s.toLowerCase().match(/\w+/g) || [];
    let score = 0;
    ws.forEach(w => {
      score += freq[w] || 0;
    });
    return { sentence: s.trim(), score };
  });

  // determine number of sentences for each length
  const total = scored.length;
  let m;
  if (length === 'short') m = Math.max(1, Math.ceil(total * 0.10));
  else if (length === 'medium') m = Math.max(2, Math.ceil(total * 0.25));
  else m = Math.max(3, Math.ceil(total * 0.5));

  scored.sort((a,b) => b.score - a.score);
  const top = scored.slice(0, m).sort((a,b) => text.indexOf(a.sentence) - text.indexOf(b.sentence));
  const summary = top.map(s => s.sentence).join(' ');
  const keyPoints = top.map(s => s.sentence);
  return `Summary:\n${summary}\n\nKey points:\n- ${keyPoints.join('\n- ')}`;
}

module.exports = {
  openaiSummarize,
  fallbackSummarize
};
