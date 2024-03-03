const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to Bayaan Translator!');
});

app.post('/translate', async (req, res) => {
  try {
    const fetch = await import('node-fetch');
    const apiKey = 'YOUR_GOOGLE_TRANSLATE_API_KEY';
    const apiUrl = 'https://translation.googleapis.com/language/translate/v2';

    const response = await fetch.default(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: req.body.text,
        source: req.body.sourceLanguage,
        target: req.body.targetLanguage,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
