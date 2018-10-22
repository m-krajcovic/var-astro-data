import React, {Component} from 'react';
import './App.css';
import ConstellationList from "./ConstellationList";
import {BASE_URL} from "./api-endpoint";
import StarList, {StarDetail} from "./StarList";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {constellations: [], stars: [], selectedStar: null};
    }

    componentDidMount() {
        this.setState({...this.state, constellationsLoading: true});
        fetch(BASE_URL + "/constellations").then(response => response.json())
            .then(value => this.setState({constellations: value, stars: [], selectedStar: null, constellationsLoading: false}));
    }

    onConstellationSelected(constellation) {
        this.setState({...this.state, starsLoading: true});
        fetch(BASE_URL + "/constellations/" + constellation + "/stars").then(response => response.json())
            .then(value => this.setState({...this.state, stars: value, starsLoading: false}));
    }

    onStarSelected(star) {
        this.setState({...this.state, starLoading: true});
        fetch(BASE_URL + "/stars/" + star.starId).then(response => response.json()).then(value => {
            this.setState({...this.state, selectedStar: value, starLoading: false});
        });
    }

    render() {
        return (
            <div className="App">
                <div className="sidebar-wrapper">
                    <div className="sidebar">
                        <ConstellationList constellations={this.state.constellations} onSelected={constellation => this.onConstellationSelected(constellation)} loading={this.state.constellationsLoading}/>
                    </div>
                    <div className="sidebar">
                        <StarList stars={this.state.stars} onSelected={star => this.onStarSelected(star)} loading={this.state.starsLoading}/>
                    </div>
                </div>
                <div className="stars-detail-wrapper">
                    <StarDetail star={this.state.selectedStar} loading={this.state.starLoading}/>
                </div>
            </div>
        );
    }
}

export default App;
