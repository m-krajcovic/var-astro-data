import React, {Component} from 'react';
import {Link} from "react-router-dom";
class StarList extends Component {

    render() {
        if (this.props.loading) {
            return (
                <span>Loading...</span>
            );
        }
        if (this.props.stars) {
            return (
                <ul>
                    {this.props.stars.map(star => {
                        return (
                            <StarListItem key={star.starName}
                                          className={this.props.selectedStarName === star.starName ? "selected" : ""} star={star}
                                          onClick={(name) => this.onSelected(name)}/>
                        )
                    })}
                </ul>
            )
        } else {
            return (
                <ul>
                    <li>Loading stars</li>
                </ul>
            )
        }
    }

    onSelected(star) {
        if (this.props.onSelected) {
            this.props.onSelected(star);
        }
    }
}

class StarListItem extends Component {
    render() {
        return (
            <li style={this.props.style} className={this.props.className}
                onClick={() => this.onClick()}>
                <Link to={"/oc/" + this.props.star.constellation + "/" + this.props.star.starName}>{this.props.star.starName} ({this.props.star.minimaCount})</Link>
            </li>
        )
    }

    onClick() {
        if (this.props.onClick) {
            this.props.onClick(this.props.star);
        }
    }
}

export default StarList;
