const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cheerio = require('cheerio');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.set('json spaces', 4);
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.json({ 
    model: "joshua 3.5",
    message: "Developed by Joshua Apostol"
  });
});

// adobo/gpt endpoint
app.get('/adobo/gpt', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const url = `https://markdevs-api.onrender.com/api/ashley/gpt?query=${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(url);
    const result = response.data.result;
    res.json({ answer: result });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching the response' });
  }
});

// Gemini endpoint
app.get('/gemini', async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).send('Prompt query parameter is required');
  }

  const headers = {
    "Content-Type": 'application/json',
    "X-WP-Nonce": '51dbc743fe',
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

// NGL endpoint
app.get('/ngl', async (req, res) => {
  const { username, message, deviceId, amount } = req.query;

  if (!username || !message || !amount) {
    return res.status(400).json({ error: "Username, message, and amount are required" });
  }

  const url = 'https://ngl.link/api/submit';
  const payload = { username, question: message, deviceId };
  const headers = { 'Content-Type': 'application/json' };

  try {
    for (let i = 0; i < parseInt(amount); i++) {
      const response = await axios.post(url, payload, { headers });
      console.log(`Message ${i + 1} sent`);
    }

    res.json({ 
      message: "Messages sent",
      developedBy: "Joshua Apostol"
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(error.response.status || 500).json({ error: "An error occurred while sending the messages" });
  }
});

// Quote endpoint
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

// Joke endpoint
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

// Fact endpoint
app.get('/fact', async (req, res) => {
  try {
    const response = await axios.get('https://useless-facts.sameerkumar.website/api');
    res.json({ fact: response.data.data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching the fact');
  }
});

// Trivia endpoint
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

// EduTrivia endpoint
app.get('/eduTrivia', async (req, res) => {
  try {
    const response = await axios.get('https://opentdb.com/api.php?amount=1&category=17');
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

// Wikipedia endpoint
app.get('/wikipedia', async (req, res) => {
  const searchQuery = req.query.search;

  if (!searchQuery) {
    return res.status(400).send('Search query parameter is required');
  }

    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchQuery)}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    const result = {
      title: data.title,
      extract: data.extract,
      page_url: data.content_urls.desktop.page,
    };

    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching information');
  }
});

// Wikipedia Image URL endpoint
app.get('/wikipedia-image-url', async (req, res) => {
  const searchQuery = req.query.search;

  if (!searchQuery) {
    return res.status(400).send('Search query parameter is required');
  }

  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(searchQuery)}&formatversion=2&pithumbsize=300`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    const page = data.query.pages[0];
    const imageUrl = page.thumbnail ? page.thumbnail.source : null;

    res.json({ imageUrl });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching the image');
  }
});

function ps(search) {
    return new Promise(async (resolve, reject) => {
        try {
            const { data, status } = await axios.get(
                `https://play.google.com/store/search?q=${search}&c=apps`,
            );
            const result = [];
            const $ = cheerio.load(data);
            $(
                ".ULeU3b > .VfPpkd-WsjYwc.VfPpkd-WsjYwc-OWXEXe-INsAgc.KC1dQ.Usd1Ac.AaN0Dd.Y8RQXd > .VfPpkd-aGsRMb > .VfPpkd-EScbFb-JIbuQc.TAQqTe > a",
            ).each((i, u) => {
                const linkk = $(u).attr("href");
                const names = $(u)
                    .find(".j2FCNc > .cXFu1 > .ubGTjb > .DdYX5")
                    .text();
                const developer = $(u)
                    .find(".j2FCNc > .cXFu1 > .ubGTjb > .wMUdtb")
                    .text();
                const img = $(u).find(".j2FCNc > img").attr("src");
                const rate = $(u)
                    .find(".j2FCNc > .cXFu1 > .ubGTjb > div")
                    .attr("aria-label");
                const rate2 = $(u)
                    .find(".j2FCNc > .cXFu1 > .ubGTjb > div > span.w2kbF")
                    .text();
                const link = `https://play.google.com${linkk}`;

                result.push({
                    link: link,
                    name: names ? names : "No name",
                    developer: developer ? developer : "No Developer",
                    image: img ? img : "https://i.ibb.co/G7CrCwN/404.png",
                    rate: rate ? rate : "No Rate",
                    rate2: rate2 ? rate2 : "No Rate",
                });
            });
            if (result.every((x) => x === undefined))
                return resolve({
                    message: "no result found",
                });
            resolve(result);
        } catch (err) {
            resolve({
                message: "no result found",
            });
        }
    });
}

app.get("/search", async (req, res) => {
    const searchQuery = req.query.q;
    if (!searchQuery) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    const results = await ps(searchQuery);
    res.json(results);
});

// Pornhub random video endpoint
app.get('/pornhub', async (req, res) => {
  try {
    const response = await axios.get('https://www.pornhub.com');
    const html = response.data;
    const $ = cheerio.load(html);

    const videos = [];
    $('li.videoBox a').each((i, element) => {
      const title = $(element).attr('title');
      const link = `https://www.pornhub.com${$(element).attr('href')}`;
      videos.push({ title, link });
    });

    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    res.json(randomVideo);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching the video');
  }
});

// Pornhub search videos endpoint
app.get('/pornhubsearch', async (req, res) => {
  const searchQuery = req.query.search;

  if (!searchQuery) {
    return res.status(400).send('Search query parameter is required');
  }

  const url = `https://www.pornhub.com/video/search?search=${encodeURIComponent(searchQuery)}`;

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const videos = [];
    $('li.videoBox').each((i, element) => {
      const title = $(element).find('span.title a').attr('title');
      const link = `https://www.pornhub.com${$(element).find('span.title a').attr('href')}`;
      const thumbnail = $(element).find('img').attr('data-thumb_url') || $(element).find('img').attr('src');
      videos.push({ title, link, thumbnail });
    });

    res.json({ videos });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching the videos');
  }
});

// Pornhub download links endpoint
app.get('/pornhubdownload', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).send('Video URL query parameter is required');
  }

  try {
    const response = await axios.get(videoUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const scripts = $('script').toArray();
    let videoLinks = [];

    for (let script of scripts) {
      const scriptContent = $(script).html();
      if (scriptContent && scriptContent.includes('flashvars_')) {
        const flashvars = JSON.parse(scriptContent.match(/flashvars_\d+\s*=\s*(\{.*?\});/)[1]);
        const mediaDefinitions = flashvars.mediaDefinitions;

        mediaDefinitions.forEach(def => {
          if (def.quality && def.videoUrl) {
            videoLinks.push({
              quality: def.quality,
              url: def.videoUrl
            });
          }
        });

        break;
      }
    }

    res.json({ videoLinks });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching the video download links');
  }
});

// Xvideos random video endpoint
app.get('/xvideos', async (req, res) => {
  try {
    const response = await axios.get('https://www.xvideos.com');
    const html = response.data;
    const $ = cheerio.load(html);

    const videos = [];
    $('div.thumb a').each((i, element) => {
      const title = $(element).attr('title');
      const link = `https://www.xvideos.com${$(element).attr('href')}`;
      videos.push({ title, link });
    });

    const randomVideo = videos[Math.floor(Math.random() * videos.length)];
    res.json(randomVideo);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching the video');
  }
});

// Xvideos search videos endpoint
app.get('/xvideosearch', async (req, res) => {
  const searchQuery = req.query.search;

  if (!searchQuery) {
    return res.status(400).send('Search query parameter is required');
  }

  const url = `https://www.xvideos.com/?k=${encodeURIComponent(searchQuery)}`;

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const videos = [];
    $('div.thumb-block').each((i, element) => {
      const title = $(element).find('p').text().trim();
      const link = $(element).find('a').attr('href');
      const thumbnail = $(element).find('img').attr('data-src');
      videos.push({ title, link, thumbnail });
    });

    res.json({ videos });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching the videos');
  }
});

// Waifu endpoint
app.get('/waifu', async (req, res) => {
  const searchQuery = req.query.search;

  if (!searchQuery) {
    return res.status(400).send('Search query parameter is required');
  }

  const url = `https://api.waifu.im/search?q=${encodeURIComponent(searchQuery)}`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    res.set('Access-Control-Allow-Origin', '*');

    res.json({ 
      data,
      message: "Developed by Joshua Apostol"
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching the data');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
