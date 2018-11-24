import React, {Component} from "react";
import {Col} from "antd";

export default class StarMap extends Component{
    constructor(props) {
        super(props);
        this.id = new Date().getTime();
    }

    componentDidMount() {
        var aladin = window.A.aladin(`#${this.id}`, {target: `${this.props.coordinates.ra} ${this.props.coordinates.dec}`,survey: "P/DSS2/color", fov:0.2});
    }

    render() {
        return (
            <div id={this.id} className="aladin-star-map-holder" style={{width: "100%"}}/>
        )
    }
}
