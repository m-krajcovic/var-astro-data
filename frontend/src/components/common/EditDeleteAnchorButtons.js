import React, {Component} from "react";
import {AnchorButton} from "./AnchorButton";
import {AnchorDeletePopconfirm} from "./DeletePopconfirm";

export class EditDeleteAnchorButtons extends Component {
    static defaultProps = {
        style: {}
    };

    render() {
        return (
            <span style={this.props.style}>
                    <AnchorButton onClick={this.props.onEdit}>Edit</AnchorButton>
                    <AnchorDeletePopconfirm onConfirm={this.props.onDelete}
                                            anchorProps={{style: {marginLeft: "0.5rem"}}}>Delete</AnchorDeletePopconfirm>
            </span>
        )
    }
}
