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

//spamshare api
app.get('/share', async (req, res) => {
  const { token, amount = 22200, url, interval = 1500, deleteAfter = 3600 } = req.query;

  if (!token || !url) {
    return res.status(400).json({ error: 'Access token and share URL are required' });
  }

  const shareCount = parseInt(amount);
  const timeInterval = parseInt(interval);
  const deleteAfterSeconds = parseInt(deleteAfter);

  let sharedCount = 0;
  let timer = null;

  try {
    await axios.get(`https://graph.facebook.com/me?access_token=${token}`);
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }

  async function sharePost() {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/me/feed?access_token=${token}&fields=id&limit=1&published=0`,
        {
          link: url,
          privacy: { value: 'SELF' },
          no_story: true,
        },
        {
          muteHttpExceptions: true,
          headers: {
            authority: 'graph.facebook.com',
            'cache-control': 'max-age=0',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
          },
          method: 'post',
        }
      );

      sharedCount++;
      const postId = response?.data?.id;

      console.log(`Post shared: ${sharedCount}`);
      console.log(`Post ID: ${postId || 'Unknown'}`);

      if (sharedCount === shareCount) {
        clearInterval(timer);
        console.log('Finished sharing posts.');

        if (postId) {
          setTimeout(() => {
            deletePost(postId);
          }, deleteAfterSeconds * 1000);
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        console.error('Failed to share post:', error.response.data);
      } else {
        console.error('Failed to share post:', error.message);
      }
      clearInterval(timer);
    }
  }

  async function deletePost(postId) {
    try {
      await axios.delete(`https://graph.facebook.com/${postId}?access_token=${token}`);
      console.log(`Post deleted: ${postId}`);
    } catch (error) {
      if (error.response && error.response.data) {
        console.error('Failed to delete post:', error.response.data);
      } else {
        console.error('Failed to delete post:', error.message);
      }
    }
  }

  timer = setInterval(sharePost, timeInterval);

  setTimeout(() => {
    clearInterval(timer);
    console.log('Loop stopped.');
  }, shareCount * timeInterval);

  res.json({ message: 'Sharing process started' });
});

//gpt4 endpoints
app.get('/gpt4', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const url = `https://markdevs-api.onrender.com/api/v2/gpt4?query=${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching the GPT-4 response' });
  }
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

//snowflakes
app.get('/snowflake', async (req, res) => {
  const ask = req.query.ask;

  if (!ask) {
    return res.status(400).json({ error: 'Ask query parameter is required' });
  }

  const url = `https://hashier-api-snowflake.vercel.app/api/snowflake?ask=${encodeURIComponent(ask)}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching the Snowflake response' });
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

// Gemini endpoint
app.get('/gemini', async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).send('Prompt query parameter is required');
  }

  const headers = {
    "Content-Type": 'application/json',
    "X-WP-Nonce": 'c11f292b1a',
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

//appstate getter
app.get('/app-state', async (req, res) => {
  const email = req.query.email;
  const password = req.query.password;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password parameters are required' });
  }

  const url = `https://markdevs-api.onrender.com/api/appstate?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    res.json(data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while fetching the app state' });
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

const loveLifeMessages = [
  "Love is not about how much you say 'I love you', but how much you prove that it's true.",
  "The best thing to hold onto in life is each other.",
  "Love recognizes no barriers. It jumps hurdles, leaps fences, penetrates walls to arrive at its destination full of hope.",
  "Love isn't something you find. Love is something that finds you.",
  "The best love is the kind that awakens the soul.",
  "You are my today and all of my tomorrows.",
  "I love you more than I have ever found a way to say to you.",
  "You make me want to be a better man.",
  "To love and be loved is to feel the sun from both sides.",
  "I would rather spend one lifetime with you, than face all the ages of this world alone.",
  "Love is composed of a single soul inhabiting two bodies.",
  "We loved with a love that was more than love.",
  "You are the source of my joy, the center of my world, and the whole of my heart.",
  "I look at you and see the rest of my life in front of my eyes.",
  "I love you not only for what you are, but for what I am when I am with you.",
  "My love for you is a journey; starting at forever, and ending at never.",
  "You have bewitched me, body and soul, and I love, I love, I love you.",
  "There is no charm equal to tenderness of heart.",
  "You are my heart, my life, my one and only thought.",
  "If I know what love is, it is because of you."
];

const tagalogInsults = [
  "Tangina mo!",
  "Ulol ka!",
  "Bobo mo!",
  "Tarantado ka!",
  "Leche ka!",
  "Peste ka!",
  "Tanga ka!",
  "Hudas ka!",
  "Walang hiya ka!",
  "Lintik ka!",
  "Gago ka!",
  "Bwesit ka!",
  "Gunggong!",
  "Pakyu ka!",
  "Salot ka!",
  "Animal ka!",
  "Hangal ka!",
  "Sira ulo ka!",
  "Hayop ka!",
  "Luko-luko ka!"
];

async function postComment(accessToken, postId, message) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/${postId}/comments`,
      { message },
      { params: { access_token: accessToken } }
    );
    return { success: true, commentId: response.data.id };
  } catch (error) {
    return { success: false, error: error.response ? error.response.data : error.message };
  }
}

function getRandomMessage(category) {
  let messages;
  if (category === 'love') {
    messages = loveLifeMessages;
  } else if (category === 'insult') {
    messages = tagalogInsults;
  } else {
    messages = loveLifeMessages.concat(tagalogInsults);
  }
  return messages[Math.floor(Math.random() * messages.length)];
}

app.get('/comment', (req, res) => {
  const { token, postId, amount, category } = req.query;

  if (!token || !postId || !amount) {
    return res.status(400).json({ error: 'Missing required query parameters.' });
  }

  const numComments = parseInt(amount, 10);
  if (isNaN(numComments) || numComments <= 0) {
    return res.status(400).json({ error: 'Invalid amount parameter.' });
  }

  const results = [];
  let count = 0;

  function postNextComment() {
    if (count >= numComments) {
      return res.json(results);
    }

    const message = getRandomMessage(category);
    postComment(token, postId, message).then(result => {
      results.push(result);
      count++;
      if (!result.success) {
        return res.json(results);
      }
      setTimeout(postNextComment, 5000);
    });
  }

  postNextComment();
});

//chords
app.get('/search/chords', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).send('Query parameter is required');
  }

  const apiUrl = `https://markdevs-api.onrender.com/search/chords?q=${encodeURIComponent(query)}`;

  try {
    const { data } = await axios.get(apiUrl);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching chords data');
  }
});

//county api
app.get('/country', async (req, res) => {
  const countryCode = req.query.code;

  if (!countryCode) {
    return res.status(400).send('Country code parameter is required');
  }

  try {
    const url = `https://restcountries.com/v3.1/alpha/${countryCode}`;
    const response = await axios.get(url);

    if (response.data && response.data.length > 0) {
      const countryData = response.data[0];
      res.json(countryData);
    } else {
      res.status(404).send('dili nako makita lugar bay');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while fetching country information');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});