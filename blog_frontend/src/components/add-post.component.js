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
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.savePost = this.savePost.bind(this);
        this.newPost = this.newPost.bind(this);

        this.state = {
            id: null,
            title: "",
            description: "",
            tags: [],
            published: false,

            submitted: false
        };
    }

    onChangeTitle(e) {
        this.setState({
            title: e.target.value
        });
    }

    onChangeDescription(e) {
        this.setState({
            description: e.target.value
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
            description: this.state.description,
            tags: this.state.tags
        };
        this.setState({
            id: data.id,
            title: data.title,
            description: data.description,
            published: data.published,
            tags: data.tags,
            submitted: true
        });
        //TODO: Uncomment code after integrating with backend
        // PostDataService.create(data)
        //     .then(response => {
        //         this.setState({
        //             id: response.data.id,
        //             title: response.data.title,
        //             description: response.data.description,
        //             published: response.data.published,
        //             tags: response.data.tags,
        //             submitted: true
        //         });
        //         console.log(response.data);
        //     })
        //     .catch(e => {
        //         console.log(e);
        //     });
    }

    newPost() {
        this.setState({
            id: null,
            title: "",
            description: "",
            published: false,
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
                                    label="Description"
                                    name="description"
                                    rows={3}
                                    rowsMax={5}
                                    value={this.state.description}
                                    onChange={this.onChangeDescription}
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