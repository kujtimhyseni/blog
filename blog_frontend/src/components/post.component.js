import React, { Component } from "react";
import PostDataService from "../services/post.service";
import ChipInput from "material-ui-chip-input";
import _ from 'lodash';
import { styles } from "../css-common"
import { TextField, Button, withStyles } from "@material-ui/core";

class Post extends Component {
    constructor(props) {
        super(props);
        this.onChangeTitle = this.onChangeTitle.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.getPost = this.getPost.bind(this);
        this.updatePublished = this.updatePublished.bind(this);
        this.updatePost = this.updatePost.bind(this);
        this.deletePost = this.deletePost.bind(this);

        this.state = {
            currentPost: {
                id: null,
                title: "",
                description: "",
                tags: [],
                published: false
            },
            message: ""
        };
    }

    componentDidMount() {
        this.getPost(this.props.match.params.id);
    }

    onChangeTitle(e) {
        const title = e.target.value;

        this.setState(function (prevState) {
            return {
                currentPost: {
                    ...prevState.currentPost,
                    title: title
                }
            };
        });
    }

    onChangeDescription(e) {
        const description = e.target.value;

        this.setState(prevState => ({
            currentPost: {
                ...prevState.currentPost,
                description: description
            }
        }));
    }

    handleAddTag = (e) => {
        const tag = e.target.value;

        this.setState(prevState => ({
            currentPost: {
                ...prevState.currentPost,
                tag: tag
            }
        }));
    }

    handleDeleteTag = (tag) => {

        this.setState({
        tags: _.without(this.state.tags, tag)
        });
    }

    getPost(id) {
        this.setState({
            currentPost: {
                id: 0,
                title: 'Lifestyle',
                description: 'post about lifestyle',
                tags: ['ifestyle','livings'],
                dateCreated: new Date()
            }
        });

        // PostDataService.get(id)
        //     .then(response => {
        //         this.setState({
        //             currentPost: response.data
        //         });
        //         console.log(response.data);
        //     })
        //     .catch(e => {
        //         console.log(e);
        //     });
    }

    updatePublished(status) {
        var data = {
            id: this.state.currentPost.id,
            title: this.state.currentPost.title,
            description: this.state.currentPost.description,
            published: status
        };

        PostDataService.update(this.state.currentPost.id, data)
            .then(response => {
                this.setState(prevState => ({
                    currentPost: {
                        ...prevState.currentPost,
                        published: status
                    }
                }));
                console.log(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    updatePost() {
        PostDataService.update(
            this.state.currentPost.id,
            this.state.currentPost
        )
            .then(response => {
                console.log(response.data);
                this.setState({
                    message: "The Post was updated successfully!"
                });
            })
            .catch(e => {
                console.log(e);
            });
    }

    deletePost() {
        PostDataService.delete(this.state.currentPost.id)
            .then(response => {
                console.log(response.data);
                this.props.history.push('/posts')
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {
        const { currentPost } = this.state;
        const { classes } = this.props

        return (
            <div>
                {currentPost ? (
                    <div className={classes.form}>
                        <h2>Post</h2>
                        <form>
                            <div>
                                <TextField
                                    className={classes.textField}
                                    label="Title"
                                    name="title"
                                    value={currentPost.title}
                                    onChange={this.onChangeTitle}
                                    required
                                />
                            </div>
                            <div>
                                <TextField
                                    className={classes.textField}
                                    label="Description"
                                    name="description"
                                    value={currentPost.description}
                                    onChange={this.onChangeDescription}
                                    required
                                />
                            </div>

                            <div className={classes.textField}>
                                <ChipInput
                                    label="Tags"
                                    value={currentPost.tags}
                                    onAdd={(chip) => this.handleAddTag(chip)}
                                    onDelete={(chip, index) => this.handleDeleteTag(chip, index)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <strong>Status: </strong>
                                </label>
                                {currentPost.published ? "Published" : "Pending"}
                            </div>
                        </form>
                        <div className={classes.buttonWrapper}>
                            {currentPost.published ? (
                                <Button
                                    className={`${classes.publish} ${classes.button}`}
                                    onClick={() => this.updatePublished(false)}
                                >
                                    UnPublish
              </Button>
                            ) : (
                                    <Button
                                        className={`${classes.publish} ${classes.button}`}
                                        onClick={() => this.updatePublished(true)}
                                    >
                                        Publish
              </Button>
                                )}
                            <Button
                                className={`${classes.delete} ${classes.button}`}
                                onClick={this.deletePost}
                            >
                                Delete
            </Button>

                            <Button
                                type="submit"
                                className={`${classes.update} ${classes.button}`}
                                onClick={this.updatePost}
                            >
                                Update
            </Button>
                        </div>
                        <p>{this.state.message}</p>
                    </div>
                ) : (
                        <div>
                            <br />
                            <p>Please click on a Post...</p>
                        </div>
                    )}
            </div>
        );
    }
}

export default withStyles(styles)(Post)