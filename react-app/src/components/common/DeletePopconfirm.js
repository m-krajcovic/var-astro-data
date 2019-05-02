import React, {Component} from "react";
import {Icon, Popconfirm} from "antd";
import {AnchorButton} from "./AnchorButton";

export class DeletePopconfirm extends Component {
    constructor(props) {
        super(props);
        this.state = {visible: false};
    }

    onVisibleChange = (visible) => {
        this.setState({...this.state, visible});
    };

    render() {
        return (
            <Popconfirm visible={this.state.visible} title="Are you sure？" okText="Yes"
                        cancelText="No"
                        onConfirm={this.props.onConfirm}
                        onCancel={() => {
                            this.setState({...this.state, visible: false})
                        }}
            onVisibleChange={this.onVisibleChange}>
                {this.props.render(e => {
                    e.stopPropagation();
                    this.setState({...this.state, visible: true})
                })}
            </Popconfirm>
        );
    }
}

export function IconDeletePopconfirm(props) {
    return (
        <DeletePopconfirm onConfirm={props.onConfirm} render={(onClick) => (<Icon onClick={onClick} className="clickable-icon" type="delete"/>)}/>
    )
}

export class AnchorDeletePopconfirm extends Component {
    static defaultProps = {
        anchorProps: {}
    };
    render() {
        return (
            <DeletePopconfirm onConfirm={this.props.onConfirm} render={(onClick) => (
                <AnchorButton type="danger" {...this.props.anchorProps} onClick={onClick}>Delete</AnchorButton>)}/>
        )
    }
}
