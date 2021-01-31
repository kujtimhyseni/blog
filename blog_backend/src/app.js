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
    await blogDb.run(`PRAGMA foreign_keys=ON`)
})()


app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.get("/blogs", async function (req, res) {
    try {
        const postPerPage = req.query.post_per_page
        const currentPage = req.query.current_page
        let orderType = req.query.order_type.toUpperCase()
        if (orderType !== "DESC" && orderType !== "ASC") {
            orderType = "ASC"
        }

        const query = `SELECT id,
                              title,
                              CASE
                                  WHEN LENGTH(content) > 300 THEN
                                      substr(content, 1, 300) || '...'
                                  ELSE
                                      content
                                  END AS content,
                              creation_date,
                              author,
                              visitor_count
                       FROM Blog ORDER BY id ${orderType} LIMIT :limit offset :offset;`
        const allBlogs = await blogDb.all(query, {":limit": postPerPage, ":offset": postPerPage * currentPage});
        await allBlogs.reduce(async (memo, blog) => {
            await memo;
            console.log(blog)
            let dbTagResult = await blogDb.all(`SELECT tag_name as tag
                                                from BlogTags
                                                where blog_id = ?`, blog.id);
            blog.tags = dbTagResult.map(row => row.tag)

        }, undefined);

        let rowCount = await blogDb.get("SELECT COUNT(*) as count from Blog")
        let totalPages = Math.ceil(rowCount.count / postPerPage)
        console.log("rowCount", rowCount)
        console.log(allBlogs)
        res.json({"number_of_pages": totalPages, "blogs:": allBlogs})
    } catch (e) {
        console.log(e)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: e.message})
    }

});
app.get("/blog/search", async function (req, res) {
    try {
        const tagToSearch = req.query.tag;
        const query = `SELECT distinct B.id,
                                       title,
                                       CASE
                                           WHEN LENGTH(content) > 50 THEN
                                               substr(content, 1, 50) || '...'
                                           ELSE
                                               content
                                           END                         AS content,
                                       creation_date,
                                       author,
                                       visitor_count,
                                       (SELECT GROUP_CONCAT(BlogTags.tag_name)
                                        from BlogTags
                                        where BlogTags.blog_id = B.id) as tags

                       from BlogTags t
                                inner join Blog B on t.blog_id = B.id
                       where tag_name LIKE ?`
        const blogsThatMatch = await blogDb.all(query, `%${tagToSearch}%`);
        res.json(blogsThatMatch)
    } catch (e) {
        console.log(e)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: e.message})
    }

});


app.get("/blog", async function (req, res) {
    try {
        const blogId = req.query.blog_id
        const query = `SELECT id, title, content, creation_date, author, visitor_count
                       FROM Blog
                       where id = ?;`
        const blog = await blogDb.get(query, blogId);
        if (blog === undefined) {
            return res.status(StatusCodes.NOT_FOUND).json({error: "Blog with requested ID does not exist"})
        }
        blog.tags = (await blogDb.all(`SELECT tag_name as tag
                                       from BlogTags
                                       where blog_id = ?`, blog.id)).map(row => row.tag)

        blog.comments = (await blogDb.all(`SELECT author_name, author_email, content
                                           from BlogComments
                                           where blog_id = ?`, blog.id))
        res.json(blog)
    } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: e.message})
    }

});


app.get("/popular_tags", async function (req, res) {
    try {
        let limit = Number(req.query.limit)
        if (!Number.isInteger(limit)) {
            limit = -1;
        }
        const query = `SELECT tag_name, count(*) as blogs_count
                       from BlogTags
                       group by tag_name
                       order by blogs_count desc LIMIT ?`
        const tags = await blogDb.all(query, limit);
        if (tags === undefined) {
            return res.status(StatusCodes.NOT_FOUND).json([])
        }
        res.json(tags)
    } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: e.message})
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
        console.log("Returning visitor_count", dbRes.visitor_count)
        res.json(dbRes)
    } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: e.message})
    }

});

app.post("/add_comment/blog/:blog_id", async function (req, res) {
    try {
        const blogID = req.params.blog_id
        const body = req.body
        const queryForInsertion = ` INSERT INTO BlogComments (blog_id, author_name, author_email, content)
                                    VALUES (?, ?, ?, ?)`
        await blogDb.run(queryForInsertion, blogID, body.author_name, body.author_email, body.content)
        res.status(StatusCodes.OK).send()
    } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: e.message})
    }

});


async function authenticateAdmin(username, password) {
    const query = `SELECT COUNT(1) AS count
                   from Admins
                   where user_name = ? and password = ?`
    const dbResult = await blogDb.get(query, username, password)
    return dbResult.count > 0;
}

app.post("/create_blog", async function (req, res) {
    try {
        const body = req.body;
        console.log(body)
        const authenticated = await authenticateAdmin(body.username, body.password);
        if (authenticated !== true) {
            return res.status(StatusCodes.UNAUTHORIZED).json({error: "UNAUTHORIZED"})
        }
        const queryForInsertion = `
            INSERT INTO Blog (title, content, creation_date, author)
            VALUES (:title, :content, datetime(), :author)`
        let dbRes = await blogDb.run(queryForInsertion, {
            ':title': body.title,
            ':content': body.content,
            ':author': body.username,
        })
        const insertedBlogID = dbRes.lastID

        for (const tag of body.tags) {
            const queryForAddingTag = `INSERT INTO BlogTags(blog_id, tag_name)
                                       VALUES (:blog_id, :tag)`
            await blogDb.run(queryForAddingTag, {':blog_id': insertedBlogID, ':tag': tag});
        }
        res.json({blog_id: insertedBlogID})
    } catch (e) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: e.message})
    }

});