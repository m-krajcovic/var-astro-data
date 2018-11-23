import React from "react";

export default function StarMap(props) {
    return (
        <img alt="star map" style={{width: "100%"}}
             src={`http://archive.stsci.edu/cgi-bin/dss_search?v=1&r=${props.coordinates.raString}&d=${props.coordinates.decString}&e=J2000&h=15.0&w=15.0&f=gif&c=none&fov=NONE&v3=`}/>
    )
}
