var twit = require(`twit`);
const axios = require("axios");
require("dotenv").config();

String.prototype.removeCharAt = function (i) {
  var tmp = this.split(""); // convert to an array
  tmp.splice(i - 1, 1); // remove 1 element from the array (adjusting for non-zero-indexed counts)
  return tmp.join(""); // reconstruct the string
};

const client = new twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000,
});

axios
  .get(
    "https://youtube.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=10&playlistId=UUOhtMAg7xh8wv_wUHMgFc-Q&key=AIzaSyCB3wG7_Cyh20HHKm7vfxjbWnZp0Z9GpgU"
  )
  .then((res) => {
    const headerDate =
      res.headers && res.headers.date ? res.headers.date : "no response date";
    const response = res.data;

    let videoID = response.items[0].contentDetails.videoId;

    axios
      .get(
        `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID}&key=AIzaSyCB3wG7_Cyh20HHKm7vfxjbWnZp0Z9GpgU`
      )
      .then((res) => {
        const headerDate =
          res.headers && res.headers.date
            ? res.headers.date
            : "no response date";
        const response = res.data;

        let published = response.items[0].snippet.publishedAt;
        published = published.substring(0, published.length - 10);
        published = published.split("-");

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, "0");
        var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
        var yyyy = today.getFullYear();
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const firstDate = new Date(published[0], published[1], published[2]);
        const secondDate = new Date(yyyy, mm, dd);

        const diffDays = Math.round(
          Math.abs((firstDate - secondDate) / oneDay)
        );

        function BotInit() {
          client.post(
            "statuses/update",
            { status: `Post Malone esta a ${diffDays} dias sem postar musica.

Confira a ultima musica disponivel:
            https://www.youtube.com/watch?v=${videoID}` },
            function (error, tweet, response) {
              if (!error) {
                console.log("Funcionou");
              }
            }
          );
        }
        
        BotInit();
      })
      .catch((err) => {
        console.log("Erro no ultimo video: ", err.message);
      });
  })
  .catch((err) => {
    console.log("Erro nos videos do canal: ", err.message);
  });

// setInterval(BotRetweet, 30 * 60 * 1000);

