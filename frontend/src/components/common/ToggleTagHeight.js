import React, {Component, Fragment} from "react";
import {ToggleTag} from "./ToggleTag";
import AnimateHeight from "react-animate-height";

export class ToggleTagHeight extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hidden: true
        }
    }

    render() {
        return (
            <Fragment>
                <ToggleTag onToggle={() => this.setState({
                    ...this.state,
                    hidden: !this.state.hidden
                })}>{this.props.tag}</ToggleTag>
                <AnimateHeight height={this.state.hidden ? 0 : "auto"}>
                    {this.props.children}
                </AnimateHeight>
            </Fragment>
        )
    }
}
