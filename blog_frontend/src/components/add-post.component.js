import React, { Component } from "react";
import PostDataService from "../services/post.service";
import _ from 'lodash';
import ChipInput from "material-ui-chip-input";
import { TextField, Button, withStyles } from "@material-ui/core"
import { styles } from "../css-common"

class AddPost extends Component {
    constructor(props) {
        super(props);
        this.onChangeTitle = this.onChangeTitle.bind(this);
        this.onChangeContent = this.onChangeContent.bind(this);
        this.savePost = this.savePost.bind(this);
        this.newPost = this.newPost.bind(this);

        this.state = {
            id: null,
            title: "",
            content: "",
            tags: [],
            submitted: false
        };
    }

    onChangeTitle(e) {
        this.setState({
            title: e.target.value
        });
    }

    onChangeContent(e) {
        this.setState({
            content: e.target.value
        });
    }

    handleAddTag = (tag) => {
        this.setState({
        tags: [...this.state.tags, tag]
        });
    }

    handleDeleteTag = (tag) => {
        this.setState({
        tags: _.without(this.state.tags, tag)
        });
    }

    savePost() {
        var data = {
            title: this.state.title,
            content: this.state.content,
            tags: this.state.tags,
            username: "kujtim",
            password: "kujtim",

        };
        PostDataService.createBlog(data)
            .then(response => {
                this.setState({
                    submitted: true
                });
                console.log(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    newPost() {
        this.setState({
            id: null,
            title: "",
            content: "",
            tags: [],
            submitted: false
        });
    }

    render() {
        const { classes } = this.props

        return (
            <React.Fragment>
                {this.state.submitted ? (
                    <div className={classes.form}>
                        <h4>You submitted successfully!</h4>
                        <Button
                            size="small"
                            color="primary"
                            variant="contained"
                            onClick={this.newPost}>
                            Add
                        </Button>
                    </div>
                ) : (
                        <div className={classes.form}>
                            <div className={classes.textField}>
                                <TextField
                                    label="Title"
                                    name="title"
                                    value={this.state.title}
                                    onChange={this.onChangeTitle}
                                    required
                                />
                            </div>

                            <div className={classes.textField}>
                                <TextField
                                    label="Content"
                                    name="content"
                                    multiline
                                    rows={6}
                                    variant="outlined"
                                    value={this.state.content}
                                    onChange={this.onChangeContent}
                                    required
                                />
                            </div>

                            <div className={classes.textField}>
                                <ChipInput
                                    label="Tags"
                                    value={this.state.tags}
                                    onAdd={(tag) => this.handleAddTag(tag)}
                                    onDelete={(tag, index) => this.handleDeleteTag(tag, index)}
                                    required
                                />
                            </div>

                            <Button
                                size="small"
                                color="primary"
                                variant="contained"
                                onClick={this.savePost}>
                                Save
                            </Button>
                        </div>
                    )}
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(AddPost)