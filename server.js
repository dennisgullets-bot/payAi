// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch'); // or use global fetch on Node 18+
const app = express();
app.use(express.json());

// Set BOT_TOKEN and CHAT_ID in .env
const BOT_TOKEN = process.env.BOT_TOKEN; // e.g. 123456:ABC... (DO NOT COMMIT)
const CHAT_ID = process.env.CHAT_ID;     // e.g. -1001234567890 or 123456789

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('Missing BOT_TOKEN or CHAT_ID in environment variables.');
  process.exit(1);
}

app.post('/send', async (req, res) => {
  try {
    const { name = '', message = '' } = req.body || {};
    if (!message) return res.status(400).json({ ok:false, error:'message required' });

    // Construct safe text
    const text = name ? `From: ${name}\n\n${message}` : message;

    // Use Telegram sendMessage endpoint
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const body = { chat_id: CHAT_ID, text, parse_mode: 'HTML' };

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!data.ok) return res.status(500).json(data);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok:false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));
