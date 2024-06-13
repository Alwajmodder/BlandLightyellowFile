const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.json({ 
    model: "gpt-3",
    message: "Developed by Joshua Apostol"
  });
});

app.get('/pinoygpt', async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).send('Prompt query parameter is required');
  }

  const url = "https://www.pinoygpt.com/wp-json/mwai-ui/v1/chats/submit";

  const payloads = {
    "botId": "default",
    "customId": "e369e9665e1e4fa3fd0cdc970f31cf12",
    "session": "N/A",
    "chatId": "idalu4ccx0d",
    "contextId": 12,
    "messages": [
      {
        "id": "m6zlfpskhwc",
        "role": "assistant",
        "content": "Hi! How can I help you?",
        "who": "AI: ",
        "timestamp": 1718204724871
      }
    ],
    "newMessage": prompt,
    "newFileId": null,
    "stream": true
  };

  const headers = {
    "Content-Type": 'application/json',
    "X-WP-Nonce": '4f7b20c9e3',
    "User-Agent": 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36'
  };

  try {
    const response = await axios.post(url, payloads, { headers: headers });
    const tite = response.data;
    const x_ = tite.split('data:')[tite.split('data:').length - 1].trim();
    res.send(x_);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

app.get('/freegpt4o8k', async (req, res) => {
  const question = req.query.question;

  if (!question) {
    return res.status(400).send('Question query parameter is required');
  }

  const url = `https://api.kenliejugarap.com/freegpt4o8k/?question=${encodeURIComponent(question)}`;

  try {
    const response = await axios.get(url);
    let answer = response.data;
    
    if (typeof answer !== 'string') {
      answer = JSON.stringify(answer);
    }

    answer = answer.replace(/Kindly click the link below\\nhttps:\/\/click2donate\.kenliejugarap\.com\\n\(Clicking the link and clicking any ads or button and wait for 30 seconds \(3 times\) everyday is a big donation and help to us to maintain the servers, last longer, and upgrade servers in the future\)/g, '');

    res.json({ answer });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching the response');
  }
});

app.get('/gemini', async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).send('Prompt query parameter is required');
  }

  const headers = {
    "Content-Type": 'application/json',
    "X-WP-Nonce": '4f7b20c9e3',
    "User-Agent": 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36'
  };

  const payloads = {
    "botId": "chatbot-4yaap9",
    "customId": null,
    "session": "N/A",
    "chatId": "qu1gk4dhqu8",
    "contextId": 12,
    "messages": [{ "id": "s7a8b8hit8", "role": "assistant", "content": "Hi! How can I help you?", "who": "AI: ", "timestamp": 1718204724913 }],
    "newMessage": prompt,
    "newFileId": null,
    "stream": true
  };

  try {
    const response = await axios.post('https://www.pinoygpt.com/wp-json/mwai-ui/v1/chats/submit', payloads, { headers });
    const data = JSON.parse(response.data.split('data:')[1].trim());
    res.send(data.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred');
  }
});

app.get('/quote', async (req, res) => {
  try {
    const response = await axios.get('https://quotes.toscrape.com');
    const html = response.data;
    const $ = cheerio.load(html);
    const quotes = [];

    $('.quote').each((index, element) => {
      const quoteText = $(element).find('.text').text();
      const quoteAuthor = $(element).find('.author').text();
      quotes.push({ text: quoteText, author: quoteAuthor });
    });

    const randomIndex = Math.floor(Math.random() * quotes.length);
    res.json(quotes[randomIndex]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching the quote');
  }
});

app.get('/joke', async (req, res) => {
  try {
    const response = await axios.get('https://icanhazdadjoke.com/', {
      headers: { 'Accept': 'application/json' }
    });
    res.json({ joke: response.data.joke });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching the joke');
  }
});

app.get('/fact', async (req, res) => {
  try {
    const response = await axios.get('https://useless-facts.sameerkumar.website/api');
    res.json({ fact: response.data.data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching the fact');
  }
});

app.get('/trivia', async (req, res) => {
  try {
    const response = await axios.get('https://opentdb.com/api.php?amount=1');
    const trivia = response.data.results[0];
    res.json({
      category: trivia.category,
      question: trivia.question,
      correct_answer: trivia.correct_answer,
      incorrect_answers: trivia.incorrect_answers
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching the trivia');
  }
});  

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});