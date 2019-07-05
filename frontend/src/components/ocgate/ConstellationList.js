import React, {Component} from 'react';
import './ConstellationList.css';
import {Link} from "react-router-dom";

class ConstellationList extends Component {
    render() {
        if (this.props.loading) {
            return (
                <span>Loading...</span>
            );
        }
        if (this.props.constellations) {
            return (
                <ul>
                    {this.props.constellations.map(entry => {
                        return (
                            <ConstellationListItem key={entry.constellation.id}
                                                   className={this.props.selectedConstellationName === entry.constellation.id ? "selected" : ""}
                                                   name={entry.constellation.abbreviation} starCount={entry.starCount}
                                                   id={entry.constellation.id}
                                                   onClick={(name) => this.onSelected(name)}/>
                        )
                    })}
                </ul>
            )
        } else {
            return (
                <ul>
                    <li>Loading constellations</li>
                </ul>
            )
        }
    }

    onSelected(constellation) {
        if (this.props.onSelected) {
            this.props.onSelected(constellation);
        }
    }
}

class ConstellationListItem extends Component {
    render() {
        return (
            <li style={this.props.style} className={this.props.className} onClick={() => this.onClick()}>
                <Link to={"/oc/" + this.props.id}>{this.props.name} ({this.props.starCount})</Link></li>
        )
    }

    onClick() {
        if (this.props.onClick) {
            this.props.onClick(this.props.name);
        }
    }
}

export default ConstellationList;
