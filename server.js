/**
 * express server open
 */
const express = require("express");
const app = express();

/**
 * [Database]
 * - mogoDB
 */
const MongoClient = require("mongodb").MongoClient;
var db;
const url = require("./store");

MongoClient.connect(url.mongoUrl, function (error, client) {
  if (error) return console.log(error);

  db = client.db("todoapp"); // database명 할당;

  app.listen(8080, function () {
    console.log(`listening on 8080`);
  });
});
