import React, {Component} from "react";
import PostDataService from "../services/post.service";
import ShowComment from "../components/view-comment-compoent";

import {styles} from "../css-common"
import {Button, Grid, TextField, ListItem, withStyles} from "@material-ui/core";
import AddComment from "./add-comment-compoent";
import $ from "jquery";

class PostsList extends Component {

    state = {
        posts: [],
        currentPost: null,
        currentIndex: -1,
        searchTag: "",
        orderType: "DESC",
        visitor_count: 0
    };


    handleAddNewComment = (name, email, comment) => {
        const newComment = {
            author_name: name,
            author_email: email !== undefined ? email : "",
            content: comment
        }
        const blog =  {...this.state.currentPost}
        PostDataService.addNewComment(blog.id, newComment)
            .then(response => {
                newComment.id = response.data.id;
                let comments = [...blog.comments]
                comments.push(newComment)
                blog.comments = comments
                this.setState({
                    currentPost: blog
                });
            })
            .catch(e => {
                console.log(e);
            });
    }


    constructor(props) {
        super(props);
        this.onChangeSearchTag = this.onChangeSearchTag.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.setActivePost = this.setActivePost.bind(this);
    }

    componentDidMount() {
        this.retrievePosts();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        $(".blog_details").on({
            mouseenter: function () {
                $(".blog_details").css("color", "darkolivegreen")
            },
            mouseleave: function () {
                $(".blog_details").css("color", "black")
            }
        });
    }

    onChangeSearchTag(e) {
        const searchTag = e.target.value;

        this.setState({
            searchTag: searchTag
        });
    }

    handleOnKeyDown = (e) => {
        if (e.key === 'Enter') {
            this.retrievePosts()
        }
    }

    retrievePosts = () => {
        PostDataService.getAllBlogPosts(this.state.searchTag)
            .then(response => {
                let blogs = response.data.blogs
                console.log(blogs)
                this.setState({
                    posts: blogs
                });
                this.setActivePost(null, -1)
            })
            .catch(e => {
                console.log(e);
            });
    }

    refreshList() {
        this.retrievePosts();
        this.setState({
            currentPost: null,
            currentIndex: -1
        });
    }

    setActivePost(post, index) {
        PostDataService.getBlog(post.id)
            .then(response => {
                let blog = response.data
                console.log(blog)
                this.setState({
                    currentPost: blog,
                    currentIndex: index
                });

                PostDataService.updateVisitorCount(post.id)
                    .then(response => {
                        let data = response.data
                        this.setState({
                            visitor_count: data.visitor_count
                        });
                    })
                    .catch(e => {
                        console.log(e);
                    });

            })
            .catch(e => {
                console.log(e);
            });
    }


    render() { // render the html
        const {classes} = this.props
        return (
            <div className={classes.form}>
                <Grid container>
                    <Grid className={classes.search} item sm={12} xs={12} md={12} xl={12} lg={12}>
                        {this.renderSearchBar()}
                    </Grid>
                    <Grid item md={5}><div style={{overflowY: "scroll", borderRight: " 0.5px solid black"}}> {this.renderPostItems()} </div> </Grid>
                    <Grid item md={7}>
                        <div style={{marginLeft: "20px", marginDown: "20px"}}>
                            {this.renderSingleBlog()}
                        </div>
                    </Grid>
                </Grid>
            </div>
        );
    }

    renderSearchBar() {
        const {searchTag} = this.state
        const {classes} = this.props

        return (
            <React.Fragment>
                <div className={classes.searchBarDiv}>
                <TextField
                    label="Search by tag"
                    value={searchTag}
                    onKeyDown={this.handleOnKeyDown}
                    onChange={this.onChangeSearchTag}
                />
                <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    className={classes.searchButton}
                    onClick={this.retrievePosts}>
                    Search
                </Button>
                </div>
            </React.Fragment>)
    }


    renderSingleBlog() {
        const {classes} = this.props
        const {posts, currentPost, visitor_count} = this.state

        if (posts.length === 0) {
            return ""
        }

        if (!currentPost) {
            return (
                <div style={{textAlign:"center" }}>
                    <br/>
                    <p>No posts clicked...</p>
                </div>
            )
        }
        return (
            <div className={classes.Post}>
                <h1 className={classes.detail} style={{textAlign:"center" }}>
                    {currentPost.title}
                </h1>
                <br/>  <br/>  <br/>
                <div className={classes.detail} style={{whiteSpace:"pre-wrap"}}>
                    {currentPost.content}
                </div>
                <br/>  <br/>
                <h4 className="blog_details">Visits: {visitor_count}</h4>

                <h4 className="blog_details">Tags: {currentPost.tags.join(", ")}</h4> <br/>
                <div>
                    {currentPost.comments.map(comment =>
                        <ShowComment key={comment.id} comment={comment} />
                    )}
                </div>
                <AddComment  onAddNewComment={this.handleAddNewComment} />
            </div>
        );
    }

    renderPostItems() {
        const {posts, currentIndex} = this.state
        const {classes} = this.props
        if (posts.length === 0) {
            return <h3>No items</h3>
        } else {
            return posts.map((Post, index) => (
                <ListItem
                    selected={index === currentIndex}
                    onClick={() => this.setActivePost(Post, index)}
                    divider
                    disableGutters
                    button
                    key={index}>
                    <div style={{display: "flex", flexDirection: "column"}}>
                        <h3>{Post.title}</h3>
                        <div style={{paddingLeft: "0"}}
                             className={classes.ListItemTile + " MuiTypography-colorTextSecondary MuiTypography-displayBlock"}>{Post.content}</div>
                        <span><br/>Tags: {Post.tags}</span>
                    </div>
                </ListItem>
            ))
        }
    }

}

export default withStyles(styles)(PostsList)