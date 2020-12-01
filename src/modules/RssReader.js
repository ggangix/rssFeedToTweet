const FeedParser = require("feedparser");
const fetch = require("node-fetch");

class RssReader {
  constructor(url) {
    this.url = url;
  }

  listen() {
    return new Promise((resolve, reject) => {
      const req = fetch(this.url);
      const feedparser = new FeedParser();
      const finalArray = [];

      req.then(function (res) {
        if (res.status === 200) {
          res.body.pipe(feedparser);
        }
      });

      feedparser.on("readable", function () {
        const stream = this;
        let item;
        while ((item = stream.read())) {
          finalArray.push({
            title: item.title,
            date: item.date,
            url: item.link,
          });
        }
      });

      feedparser.on("end", () => {
        resolve(finalArray);
      });
    });
  }
}

module.exports = RssReader;
