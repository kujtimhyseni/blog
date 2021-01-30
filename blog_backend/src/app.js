const express = require("express");
const http = require('http');

const hostname = '127.0.0.1'
const DB_FILE_PATH = "./blog.db"
const port = 8080

const app = express();

http.createServer(app).listen(port);
console.log(`Server running at http://${hostname}:${port}/`)

const sqlite3 = require('sqlite3');
const {open} = require('sqlite');

let blogDb;

(async () => {
    blogDb = await open({filename: DB_FILE_PATH, driver: sqlite3.Database})
})()

app.get("/", async function (req, res) {
    try {
        const query = 'SELECT name, age FROM test;'
        const row = await blogDb.get(query);
        console.log(row)
        res.json(row)
    } catch (e) {
        res.json({error: e.message})
    }

});
