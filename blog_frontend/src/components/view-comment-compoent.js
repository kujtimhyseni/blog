import React, {Component} from "react";
import {Card, CardContent, makeStyles, withStyles} from "@material-ui/core";
import {styles} from "../css-common";


const style = {
    root: {
        marginTop:"15px",
        marginBottom:"15px",
        minWidth: 275,
        backgroundColor: "#F0F0F0"
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
};


class ShowComment extends Component {
    render() {
        const {comment, classes} = this.props
        return (
            <Card className={classes.root}>
                <CardContent>
                    <div >
                        <h4>Comment author: {comment.author_name} <br/> Comment email: {comment.author_email}</h4>
                        <span>{comment.content}</span>
                    </div>
                </CardContent>
            </Card>
        )
    }
}

export default withStyles(style)(ShowComment)