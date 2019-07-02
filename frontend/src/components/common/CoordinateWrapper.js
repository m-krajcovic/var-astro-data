import React from "react";
import {Copyable} from "./Copyable";

export function CoordinateWrapper(props) {
    const style = {
        fontFamily: "monospace"
    };
    if (props.size === "large") {
        style["fontSize"] = "1rem";
    } else if (props.size === "small") {
        style["fontSize"] = "0.75rem"
    }
    return (
        <Copyable value={props.value} style={style}/>
    )
}
