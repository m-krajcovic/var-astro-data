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
        fetch(BASE_URL + "/constellations").then(response => response.json())
            .then(value => this.setState({constellations: value, stars: [], selectedStar: null}));
    }

    onConstellationSelected(constellation) {
        fetch(BASE_URL + "/constellations/" + constellation + "/stars").then(response => response.json())
            .then(value => this.setState({...this.state, stars: value}));
    }

    onStarSelected(star) {
        fetch(BASE_URL + "/stars/" + star.starId).then(response => response.json()).then(value => {
            this.setState({...this.state, selectedStar: value});
        });
    }

    render() {
        return (
            <div className="App">
                {/*<header className="App-header">*/}
                {/*<img src={logo} className="App-logo" alt="logo" />*/}
                {/*<p>Edit <code>src/App.js</code> and save to reload.</p>*/}
                {/*</header>*/}
                <div className="sidebar-wrapper">
                    <div className="sidebar">
                        <ConstellationList constellations={this.state.constellations} onSelected={constellation => this.onConstellationSelected(constellation)}/>
                    </div>
                    <div className="sidebar">
                        <StarList stars={this.state.stars} onSelected={star => this.onStarSelected(star)}/>
                    </div>
                </div>
                <div className="stars-detail-wrapper">
                    <StarDetail star={this.state.selectedStar}/>
                </div>
            </div>
        );
    }
}

export default App;
