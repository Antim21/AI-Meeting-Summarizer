// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/summarize', async (req, res) => {
    const { prompt, api } = req.body;
    let apiKey, apiUrl, body;
    const headers = { 'Content-Type': 'application/json' };

    try {
        switch (api) {
            case 'groq':
                apiKey = process.env.GROQ_API_KEY;
                if (!apiKey) throw new Error('Groq API key is missing.');
                apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
                headers['Authorization'] = `Bearer ${apiKey}`;
                body = { messages: [{ role: "user", content: prompt }], model: "llama3-8b-8192" };
                break;
            case 'openai':
                apiKey = process.env.OPENAI_API_KEY;
                if (!apiKey) throw new Error('OpenAI API key is missing.');
                apiUrl = 'https://api.openai.com/v1/chat/completions';
                headers['Authorization'] = `Bearer ${apiKey}`;
                body = { messages: [{ role: "user", content: prompt }], model: "gpt-4o" };
                break;
            case 'gemini':
                apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) throw new Error('Gemini API key is missing.');
                apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
                body = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
                break;
            default:
                return res.status(400).json({ message: 'Invalid API selected.' });
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'API request failed.');
        }

        const result = await response.json();
        const summary = api === 'gemini' ? result.candidates[0].content.parts[0].text : result.choices[0].message.content;
        res.json({ summary });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend server is listening at http://localhost:${port}`);
});