import React, {Component} from "react";
import {Button} from "antd";

export class AnchorButton extends Component {
    render() {
        return (
            <Button className={this.props.className} style={{height: 21, padding: 0, border: "none", boxShadow: "none"}} type="primary" ghost size="small" htmlType="button" onClick={this.props.onClick}>{this.props.children}</Button>
        );
    }
}
