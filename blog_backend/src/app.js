const express = require("express");
const bodyParser = require('body-parser');
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
app.use(bodyParser.json());
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

app.put("/count_visitor/blog/:blog_id", async function (req, res) {
    try {
        const blogID = req.params.blog_id
        console.log('Count_visitor for blog with id:', req.params.blog_id);
        var dbRes = await blogDb.run(`UPDATE Blog
                                      set visitor_count = visitor_count + 1
                                      where id = ?`, blogID);
        if (dbRes.changes === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({error: `No such blog ${blogID}`})
        }
        dbRes = await blogDb.get("SELECT visitor_count from Blog where id = ?", blogID);
        console.log("Returning visitor_count",dbRes.visitor_count)
        res.json(dbRes)
    } catch (e) {
        res.json({error: e.message})
    }

});