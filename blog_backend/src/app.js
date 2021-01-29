const express = require("express");
const http = require('http');

const hostname = '127.0.0.1'
const port = 8080

const app = express();

http.createServer(app).listen(port);
console.log(`Server running at http://${hostname}:${port}/`)

app.get("/", function (req, res) {
    res.send("Hello world");
});

