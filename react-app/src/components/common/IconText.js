import {Icon} from "antd";
import React from "react";

export const IconText = ({type, text, onClick}) => (
    <span onClick={onClick}>
        <Icon type={type} style={{marginRight: 8}}/>
        {text}
    </span>
);
