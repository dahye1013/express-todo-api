/**
 * express server open
 */
const express = require("express");
const app = express();

/**
 * [bodyParser]
 * 실제로는 express.js에도 빌트인 body parser가 들어있으므로 생략 가능하다.
 * ref: https://expressjs.com/en/4x/api.html#express-json-middleware
 *
 * TODO: 리팩토링 진행시 수정
 */
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * [Database]
 * - mogoDB
 */
const MongoClient = require("mongodb").MongoClient;
var db;
const url = require("./store");

/**
 * [EJS Setting]
 */
app.set("view engine", "ejs");

MongoClient.connect(url.mongoUrl, function (error, client) {
  if (error) return console.log(error);

  db = client.db("todoapp"); // database명 할당;

  app.listen(8080, function () {
    console.log(`listening on 8080`);
  });
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/add", async function (req, res) {
  const { title, date } = req.body;
  let totPostsCount = await db
    .collection("counter")
    .findOne({ name: "totalPosts" }, function (err, result) {
      let totPostsCount = result.totalPostCount;
      console.log(result.totalPostCount);

      db.collection("post").insertOne(
        {
          _id: totPostsCount++,
          title,
          date,
        },
        function (err, ok) {
          console.log("success adding");
          db.collection("counter").updateOne(
            { name: "totalPosts" },
            //증감 연산자
            { $inc: { totalPostCount: 1 } },
            { totalPostCount: 1 },
            function (err, result) {
              if (err) return console.log(err);
            }
          );
        }
      );
    });
  res.send("TODO 전송 완료");
});

app.get("/list", function (req, res) {
  db.collection("post")
    .find()
    .toArray(function (err, result) {
      res.render("list.ejs", { todos: result });
    });
});
