import React, { Component } from "react";
import { Switch, Route, Link } from "react-router-dom";
import "./App.css";
import { styles } from "./css-common"

import AddPost from "./components/add-post.component";
import Post from "./components/post.component";
import PostsList from "./components/posts-list.component";
import Sidebar from "./components/sidebar";

import { AppBar, Toolbar, Typography, withStyles,Drawer } from '@material-ui/core';

class App extends Component {
  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <AppBar  className={classes.appBar} position="fixed">
          <Toolbar >
            <Typography style={{width : "240"}} className={classes.name} variant="h6">
              Blog
            </Typography>
            {/* just declare a link */}
            <Link to={"/posts"} className={classes.link}> 
              <Typography variant="body2">
                Posts
              </Typography>
            </Link>
            <Link to={"/add"} className={classes.link}>
              <Typography variant="body2">
                Add Post
            </Typography>
            </Link>
          </Toolbar>
        </AppBar>
        <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
              paper: classes.drawerPaper,
            }}
            anchor="left" >
          <div className={classes.toolbar} />
          <Sidebar/>
        </Drawer>
        <main className={classes.content}>
          <Switch>
            {/* map route with component */}
            <Route exact path={["/", "/posts"]} component={PostsList} /> 
            <Route exact path="/add" component={AddPost} />
            <Route path="/posts/:id" component={Post} />
          </Switch>
        </main>
      </div>
    );
  }
}

export default withStyles(styles)(App);