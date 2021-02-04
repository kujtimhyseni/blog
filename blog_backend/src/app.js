const express = require("express");
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./../swagger_output.json')
const {StatusCodes} = require('http-status-codes');
const sqlite3 = require('sqlite3');
const {open} = require('sqlite');
const $rdf = require('rdflib')
const {Namespace} = require("rdflib");

var store = $rdf.graph()

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
        const tagToSearch = req.query.filter_tag;
        let orderType = req.query.order_type
        if (orderType === undefined  || (orderType.toUpperCase() !== "DESC" && orderType.toUpperCase() !== "ASC")) {
            orderType = "DESC"
        }
        const query = `SELECT distinct B.id,
                                       title,
                                       CASE
                                           WHEN LENGTH(content) > 300 THEN
                                               substr(content, 1, 300) || '...'
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
                       where tag_name LIKE ?  ORDER BY B.id ${orderType}`
        const blogsThatMatch = await blogDb.all(query, `%${tagToSearch}%`);
        res.json({blogs:blogsThatMatch})
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

        blog.comments = (await blogDb.all(`SELECT id, author_name, author_email, content 
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
        const dbRes = await blogDb.run(queryForInsertion, blogID, body.author_name, body.author_email, body.content)
        const insertedCommentID = dbRes.lastID

        res.status(StatusCodes.OK).json({id : insertedCommentID})
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



//// RDF and SPARQL


async function getFirstBlogFromDB() {
    const query = `SELECT B.id,
                          title,
                          content,
                          creation_date,
                          author,
                          visitor_count,
                          (SELECT GROUP_CONCAT(BlogTags.tag_name)
                           from BlogTags
                           where BlogTags.blog_id = B.id) as tags
                   from BlogTags t
                            inner join Blog B on t.blog_id = B.id
                   ORDER BY B.id ASC LIMIT 1`
    return (await blogDb.all(query))[0];
}

app.get("/rdf",  async function (req, res) {

    var RDF = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
    var BLG = Namespace("http://www.example.org/2021/BLG#")  // fictional blog vocabulary. //todo

    var rdfInstanceOF = RDF('instanceOf');
    var rdfContains = RDF('contains');

    //Input general data about blog
    var blogApp = $rdf.sym(`${BLG().value}BlogApp`);
    store.add(blogApp, rdfInstanceOF, "Website")

    store.add(blogApp,rdfContains,"PopularTags")
    store.add(blogApp,rdfContains,"blogs")

    console.log("SPARQL query #1 --START-- Show me what type of instance is BlogApp")
    result = store.querySync(
        $rdf.SPARQLToQuery(
            `SELECT ?o WHERE { ${blogApp} ${rdfInstanceOF} ?o.}`
            , false, store
        )
    )
    console.log(result);
    console.log("SPARQL query #1 ---------- END")
/// ------------------------------------------------------------------------

    console.log("SPARQL query #2 --START--  show me what does BlogApp contain")

    result = store.querySync(
        $rdf.SPARQLToQuery(
            `SELECT ?o WHERE { ${blogApp} ${rdfContains} ?o.}`,
            false, store
        )
    )
    console.log(result);
    console.log("SPARQL query #2 ---------- END")
/// ------------------------------------------------------------------------

    //Input some data about a specific blog
    const blog = await getFirstBlogFromDB();
    var firstBlog = $rdf.sym(`${BLG().value}BLG1`);
    console.log(blog)
    var blgHasID = BLG("hasID")
    var blgHasTitle = BLG("hasTitle")
    var blgHasAuthor= BLG("hasAuthor")
    var blgHasVisitors = BLG("hasVisitors")

    store.add(firstBlog, blgHasID, blog.id)
    store.add(firstBlog, blgHasTitle, blog.title)
    store.add(firstBlog, blgHasAuthor, blog.author)
    store.add(firstBlog, blgHasVisitors, blog.visitor_count)


    console.log("SPARQL query #3 --START-- show me the ID of the blog")
    result = store.querySync(
        $rdf.SPARQLToQuery(
            `SELECT ?o WHERE { ${firstBlog} ${blgHasID} ?o.}`
            , false, store
        )
    )
    console.log(result);
    console.log("SPARQL query #3 ---------- END")
/// ------------------------------------------------------------------------


    console.log("SPARQL query #4 --START-- show me the title of the blog")

    result = store.querySync(
        $rdf.SPARQLToQuery(
            `SELECT ?o WHERE { ${firstBlog} ${blgHasTitle} ?o.}`
            , false, store
        )
    )
    console.log(result);
    console.log("SPARQL query #4 ---------- END")
/// ------------------------------------------------------------------------


    console.log("SPARQL query #5 --START-- show me the title of the blog")

    result = store.querySync(
        $rdf.SPARQLToQuery(
            `SELECT ?o WHERE { ${firstBlog} ${blgHasAuthor} ?o.}`
            , false, store
        )
    )
    console.log(result);
    console.log("SPARQL query #5 ---------- END")
/// ------------------------------------------------------------------------

/// ------------------------------------------------------------------------


    /// SPARQL query #5....
    console.log("SPARQL query #6 --START -- show me the title of the blog")

    result = store.querySync(
        $rdf.SPARQLToQuery(
            `SELECT ?o WHERE {
                ${firstBlog} ${blgHasVisitors} ?o. 
             }`
            , false, store
        )
    )
    console.log(result);
    console.log("SPARQL query #6 ---------- END")
/// ------------------------------------------------------------------------

    //Serialize RDF store
    $rdf.serialize(null, store, 'https://example.com', 'application/rdf+xml', function(err, str) {
        console.log(str);
        res.send(str);

    });

});