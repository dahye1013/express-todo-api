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
let db;
let clinet = "todoapp";
let collection = {
  POST: "post",
  COUNTER: "counter",
};
const url = require("./store");
const { Collection } = require("mongodb");

/**
 * [EJS Setting]
 */
app.set("view engine", "ejs");

MongoClient.connect(url.mongoUrl, (err, client) => {
  if (err) return console.log(err);

  db = client.db(clinet); // database명 할당;

  app.listen(8080, () => {
    console.log(`listening on 8080`);
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/add", async (req, res) => {
  const { title, date } = req.body;
  let totPostsCount;

  //1. find counter
  try {
    const data = await db
      .collection(collection.COUNTER)
      .findOne({ name: "totalPosts" });
    totPostsCount = data.totalPostCount;
  } catch (err) {
    console.error(err, " - fail to get total posts counter");
  }

  //2. insert todo
  try {
    await db.collection(collection.POST).insertOne({
      _id: ++totPostsCount,
      title,
      date,
      delYn: "N",
    });
  } catch (err) {
    console.error(err, " - fail to insert");
  }

  //3. update counter
  try {
    await db.collection(collection.COUNTER).updateOne(
      { name: "totalPosts" },
      //monggo db 내장 증감 연산자
      { $inc: { totalPostCount: 1 } },
      { totalPostCount: 1 }
    );
  } catch (err) {
    console.log(err, " - fail to update posts counter");
  }

  //4. move to list page
  db.collection(collection.POST)
    .find()
    .toArray((err, result) => {
      if (err) return console.log(err);
      res.render("list.ejs", { todos: result });
    });
  //  res.send("TODO 전송 완료");
});

app.get("/list", (req, res) => {
  db.collection(collection.POST)
    .find()
    .toArray(function (err, result) {
      if (err) return console.log(err);
      res.render("list.ejs", { todos: result });
    });
});

app.delete("/delete", (req, res) => {
  const { _id } = req.body;
  db.collection(collection.POST).deleteOne(
    { _id: parseInt(_id) },
    (error, result) => {
      console.log("success delete");
      res.status(200).send({ message: "성공했습니다." });
    }
  );
});

app.get("/detail/:id", (req, res) => {
  db.collection(collection.POST).findOne(
    { _id: parseInt(req.params.id) },
    (err, result) => {
      if (err) return console.log(err);
      res.render("detail.ejs", { data: result });
    }
  );
});
