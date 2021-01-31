import React, {Component} from "react";
import PostDataService from "../services/post.service";

import {styles} from "../css-common"
import {Button, Grid, TextField, ListItem, withStyles} from "@material-ui/core";

class PostsList extends Component {

    state = {
        posts: [],
        currentPost: null,
        currentIndex: -1,
        searchTag: "",
        orderType: "DESC"
    };


    constructor(props) {
        super(props);
        this.onChangeSearchTag = this.onChangeSearchTag.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.setActivePost = this.setActivePost.bind(this);
    }

    componentDidMount() {
        this.retrievePosts();
    }

    onChangeSearchTag(e) {
        const searchTag = e.target.value;

        this.setState({
            searchTag: searchTag
        });
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

    setActivePost(Post, index) {
        this.setState({
            currentPost: Post,
            currentIndex: index
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
                    <Grid item md={5}> {this.renderPostItems()}  </Grid>
                    <Grid item md={7}>
                        <div style={{marginLeft: "20px"}}>
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
                <TextField
                    label="Search by tag"
                    value={searchTag}
                    onChange={this.onChangeSearchTag}
                />
                <Button
                    size="small"
                    variant="outlined"
                    className={classes.textField}
                    onClick={this.retrievePosts}>
                    Search
                </Button>
            </React.Fragment>)
    }


    renderSingleBlog() {
        const {classes} = this.props
        const {posts, currentPost} = this.state

        if (posts.length === 0) {
            return ""
        }

        if (!currentPost) {
            return (
                <div>
                    <br/>
                    <p>No posts clicked...</p>
                </div>
            )
        }
        return (
            <div className={classes.Post}>
                <h4>Post</h4>
                <div className={classes.detail}>
                    <label>
                        <strong>Title:</strong>
                    </label>{" "}
                    {currentPost.title}
                </div>
                <div className={classes.detail}>
                    <label>
                        <strong>Description:</strong>
                    </label>{" "}
                    {currentPost.content}
                </div>
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