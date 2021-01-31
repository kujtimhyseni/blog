import React, { Component } from "react";
import PostDataService from "../services/post.service";
import { Link } from "react-router-dom";

import { styles } from "../css-common"
import { TextField, Button, Grid, ListItem, withStyles } from "@material-ui/core";

class PostsList extends Component {
  constructor(props) {
    super(props);
    this.onChangeSearchTag = this.onChangeSearchTag.bind(this);
    this.retrievePosts = this.retrievePosts.bind(this);
    this.refreshList = this.refreshList.bind(this);
    this.setActivePost = this.setActivePost.bind(this);
    // this.removeAllPosts = this.removeAllPosts.bind(this);
    this.searchTag = this.searchTag.bind(this);

    this.state = {
      posts: [],
      currentPost: null,
      currentIndex: -1,
      searchTag: ""
    };
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

  retrievePosts() {
    let items = [{
      id: 0,
      title: 'Lifestyle',
      description: 'post about lifestyle',
      tags: ['ifestyle','livings'],
      dateCreated: new Date()
    },
    {
      id: 1,
      title: 'Health',
      description: 'post about health',
      tags: ['health'],
      dateCreated: new Date()
    }];
    
    this.setState({
      posts: items
    });
    this.setActivePost(items[0]); // open the first post in the list


    //TODO: Uncomment code after integrating with backend
    // PostDataService.getAll()
    //   .then(response => {
    //     this.setState({
    //       posts: response.data
    //     });
    //     console.log(response.data);
    //   })
    //   .catch(e => {
    //     console.log(e);
    //   });
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

  // removeAllPosts() {
  //   PostDataService.deleteAll()
  //     .then(response => {
  //       console.log(response.data);
  //       this.refreshList();
  //     })
  //     .catch(e => {
  //       console.log(e);
  //     });
  // }

  searchTag() {
    PostDataService.findByTag(this.state.searchTag)
      .then(response => {
        this.setState({
          posts: response.data
        });
        console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() { // render the html
    const { classes } = this.props
    const { searchTag, posts, currentPost, currentIndex } = this.state;

    return (
      <div className={classes.form}>
        <Grid container>
          <Grid className={classes.search} item sm={12} xs={12} md={12} xl={12} lg={12}>
            <TextField
              label="Search by tag"
              value={searchTag}
              onChange={this.onChangeSearchTag}
            />
            <Button
              size="small"
              variant="outlined"
              className={classes.textField}
              onClick={this.searchTag}>
              Search
            </Button>
          </Grid>
          <Grid item md={4}>

            <div className="list-group">
              {posts &&
                posts.map((Post, index) => (
                  <ListItem
                    selected={index === currentIndex}
                    onClick={() => this.setActivePost(Post, index)}
                    divider
                    button	
                    key={index}>
                    <ul style={{ listStyleType : "none"}}>
                      <li><h3>{Post.title}</h3></li>
                      <li> <span>{Post.description}</span></li>
                    </ul>
                  </ListItem>
                ))}
            </div>
          </Grid>
          <Grid item md={8}>
            {currentPost ? (
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
                  {currentPost.description}
                </div>
                <div className={classes.detail}>
                  <label>
                    <strong>Status:</strong>
                  </label>{" "}
                  {currentPost.published ? "Published" : "Pending"}
                </div>

                <Link
                  to={"/posts/" + currentPost.id}
                  className={classes.edit}
                >
                  Edit
              </Link>
              </div>
            ) : (
                <div>
                  <br />
                  <p className={classes.Post}>Please click on a Post...</p>
                </div>
              )}
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(PostsList)