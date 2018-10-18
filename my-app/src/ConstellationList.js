import React, {Component} from 'react';
import './ConstellationList.css';

class ConstellationList extends Component {
    constructor(props) {
        super(props);
        this.state = {selectedConstellation: null};
    }

    render() {
        if (this.props.constellations) {
            return (
                <ul>
                    {this.props.constellations.map(constellation => {
                        return (
                            <ConstellationListItem key={constellation.name} className={this.state.selectedConstellation === constellation.name ? "selected" : ""} name={constellation.name} starCount={constellation.starCount} onClick={(name) => this.onSelected(name)}/>
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
        this.setState({selectedConstellation: constellation});
    }
}

class ConstellationListItem extends Component {
    render() {
        return (
            <li style={[this.props.style]} className={this.props.className} onClick={() => this.onClick()}>{this.props.name} ({this.props.starCount})</li>
        )
    }

    onClick() {
        if (this.props.onClick) {
            this.props.onClick(this.props.name);
        }
    }
}

export default ConstellationList;
