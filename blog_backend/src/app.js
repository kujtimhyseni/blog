const express = require("express");
const http = require('http');
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./../swagger_output.json')
const {StatusCodes} = require('http-status-codes');
const sqlite3 = require('sqlite3');
const {open} = require('sqlite');

const HOSTNAME = '127.0.0.1'
const PORT = 3000
const DB_FILE_PATH = "./blog.db"

const app = express();
app.use(cors())
http.createServer(app).listen(PORT);

console.log(`Server running at http://${HOSTNAME}:${PORT}/`)

let blogDb;

(async () => {
    blogDb = await open({filename: DB_FILE_PATH, driver: sqlite3.Database})
})()


app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.get("/blogs", async function (req, res) {
    try {
        const query = `SELECT id,
                              title,
                              CASE
                                  WHEN LENGTH(content) > 50 THEN
                                      substr(content, 1, 50) || '...'
                                  ELSE
                                      content
                                  END AS content,
                              creation_date,
                              author,
                              visitor_count
                       FROM Blog;`
        const row = await blogDb.all(query);
        console.log(row)
        res.json(row)
    } catch (e) {
        res.json({error: e.message})
    }

});