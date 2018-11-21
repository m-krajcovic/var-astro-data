import React, {Component} from "react";
import {Popover} from "antd";

export class Copyable extends Component {
    constructor(props) {
        super(props);
        this.state = {popoverVisible: false};
    }

    handleOnClick = () => {
        const el = document.createElement('textarea');
        el.value = this.props.value;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        this.setState({popoverVisible: true});
        setTimeout(() => {
            this.setState({popoverVisible: false});
        }, 600)
    };

    render() {
        const style = {
            cursor: "pointer"
        };
        if (this.props.style) {
            Object.assign(style, this.props.style);
        }

        return (
            <Popover trigger="click" content="Copied" visible={this.state.popoverVisible}>
                <span className="copyable" onClick={this.handleOnClick} style={style}>{this.props.value}</span>
            </Popover>
        )
    }
}
