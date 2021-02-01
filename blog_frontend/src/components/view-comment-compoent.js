import React, {Component} from "react";
import {withStyles} from "@material-ui/core";
import {styles} from "../css-common";


class ShowComment extends Component {
    render() {
        const {comment, classes} = this.props
        return (
            <div className={classes.BlogComment}>
                <h4>Comment author: {comment.author_name} <br/> Comment email: {comment.author_email}</h4>
                <span>{comment.content}</span>

            </div>
        )
    }
}

export default withStyles(styles)(ShowComment)