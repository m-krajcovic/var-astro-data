import React from "react";
import {Tag} from "antd";

export class ToggleTag extends React.Component {
    state = {checked: false};

    handleChange = (checked) => {
        this.setState({checked});
        this.props.onToggle(checked);
    };

    render() {
        return <Tag.CheckableTag {...this.props} checked={this.state.checked} onChange={this.handleChange}/>;
    }
}
