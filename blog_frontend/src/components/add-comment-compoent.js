import React, {Component} from "react";
import {Button, TextField, withStyles} from "@material-ui/core";
import {styles} from "../css-common";


class AddComment extends Component {

    state = {
        name : "",
        email:"",
        comment:"",
        nameError :false,
        commentError :false
    }

    onNameChanged = (event) =>{
        this.setState({
            name: event.target.value
        });
    }

    onEmailChanged = (event) =>{
        this.setState({
            email: event.target.value
        });
    }

    onCommentChanged = (event) =>{
        this.setState({
            comment: event.target.value
        });
    }

    resetComponent= () =>{
        let newState = {
            name : "",
            email:"",
            comment:"",
            nameError :false,
            commentError :false
        }
        console.log("resetComponent",newState)
        this.setState(newState)
    }

    onSubmitClicked = () =>{
        let validForm = true;

        let validName = this.state.name.length > 0;
        this.setState({nameError :!validName})
        validForm = validForm && validName


        let validComment = this.state.comment.length > 0;
        this.setState({commentError :!validComment})
        validForm = validForm && validComment

        if (validForm){
            const {name,email,comment} = this.state
            this.props.onAddNewComment(name,email,comment)
            this.resetComponent()
        }
    }

    render() {
        const {classes} = this.props
        const {name,email,comment,nameError,commentError} = this.state

        return (
            <div className={classes.AddComment}>
                <span>Add a comment:</span> <br/>
                <TextField
                    error={ nameError}
                    helperText={nameError ? "This field is mandatory" : ""}
                    fullWidth
                    required
                    value={name}
                    label="Name"
                    onChange={this.onNameChanged}
                />
                <br/>
                <TextField
                    fullWidth
                    value={email}
                    label="Email"
                    onChange={this.onEmailChanged}
                />
                <br/><br/>
                <TextField
                    required
                    value={comment}
                    error={ commentError}
                    helperText={commentError ? "This field is mandatory" : ""}
                    variant="outlined"
                    fullWidth
                    multiline
                    label="Comment"
                    onChange={this.onCommentChanged}
                />
                <br/>
                <Button
                    size="small"
                    variant="outlined"
                    className={classes.textField}
                    onClick={this.onSubmitClicked}>
                    Submit comment
                </Button>

            </div>
        )
    }

}
export default withStyles(styles)(AddComment)