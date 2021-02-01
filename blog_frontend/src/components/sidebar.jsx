import React, {Component} from "react";
import {Grid, ListItem, withStyles} from "@material-ui/core";
import {styles} from "../css-common";
import PostDataService from "../services/post.service";


class Sidebar extends Component {
    state = {
        tags: []
    }

    componentDidMount(){
        PostDataService.getPopularTags()
          .then(response => {
            this.setState({
              tags: response.data
            });
            console.log(response.data);
          })
          .catch(e => {
            console.log(e);
          });
    }


    render() {
        const { classes } = this.props
        return (
            <React.Fragment>
                <h2 className={classes.name} >Popular tags</h2>
                <Grid item>
                    {this.state.tags.map(tag =>
                        <ListItem key={tag.tag_name} divider >
                            <div className={classes.detail}>({tag.blogs_count}): {tag.tag_name}</div>
                            {/*<div className={classes.detail}></div>*/}
                        </ListItem>)}
                </Grid>
            </React.Fragment>
        )
    };
}

export default withStyles(styles)(Sidebar)