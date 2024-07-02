import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const client = new Anthropic({
  apiKey: '',
});

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

app.post('/api/message', async (req, res) => {
  try {
    console.log('req body:', req.body);
    const { prompt } = req.body;
    console.log('content from frontend', prompt)
    if (!prompt) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await client.messages.create({
      messages: [
        {
          role: 'user',
          content:  [{
            'type': "text",
            'text': 'give me anime.js code for growing tree'
            }]
        },
      ],
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
