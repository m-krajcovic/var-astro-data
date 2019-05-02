import React, {Component} from "react";
import {Button} from "antd";

export class AnchorButton extends Component {
    render() {
        let style = {height: 21, padding: 0, border: "none", boxShadow: "none"};
        if (this.props.style) {
            style = {...style, ...this.props.style};
        }
        return (
            <Button
                disabled={this.props.disabled}
                className={this.props.className}
                style={style}
                type={this.props.type || "primary"}
                ghost
                size="small"
                htmlType="button"
                onClick={this.props.onClick}>
                {this.props.children}
            </Button>
        );
    }
}
