const RssReader = require("./src/modules/RssReader");
const Twitter = require("twitter");
require("dotenv").config();

const timeToInterval = 2 * 60 * 60 * 1000; // execute every 2 hours.
const rssXml = process.env.FEED_RSS; //  URL where the feed is.
let lastTweeted = false;

const client = new Twitter({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

function start() {
  readAndTweet();

  setInterval(() => {
    readAndTweet();
  }, timeToInterval);
}

function readAndTweet() {
  const reader = new RssReader(rssXml);
  reader.listen().then((rss) => {
    checkForNewAndTweet(rss);
  });

  function checkForNewAndTweet(rss) {
    for (i = 0; i < rss.length; i++) {
      const item = rss[i];
      if (isMostRecent(item.date, lastTweeted.date)) {
        return tweet(item);
      }
    }
    console.log("Nothing new!!");
  }
}

function isMostRecent(a, b) {
  if (!b) return true;

  const dateA = new Date(a).getTime();
  const dateB = new Date(b).getTime();

  if (dateA > dateB) {
    return true;
  }

  return false;
}

function tweet(item) {
  lastTweeted = item; // Save last tweeted
  console.log(item);
  client.post(
    "statuses/update",
    { status: `🤖 New Blog Post: ${item.title} 👨‍💻${item.url}` },
    (error, tweet, response) => {
      if (error) console.log("something was wrong!");
      if (response) console.log("tweeted ;)");
    }
  );
}

start();
