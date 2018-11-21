import React from "react";
import {Copyable} from "./Copyable";

export function CoordinateWrapper(props) {
    return (
        <Copyable value={props.value} style={{fontFamily: "monospace", fontSize: "1rem"}}/>
    )
}
