import React, {Component} from 'react';
import './App.css';
import './components/ocgate/StarList.css';
import ConstellationList from "./components/ocgate/ConstellationList";
import {BASE_URL} from "./api-endpoint";
import StarList from "./components/ocgate/StarList";
import StarDetail from "./components/ocgate/StarDetail";
import { BrowserRouter as Router, Route, Link, Redirect, NavLink } from "react-router-dom";

class App extends Component {
    render() {
        return (
            <Router>
                <div className="app">
                    <div class="app-header">
                        <NavLink to="/oc" activeClassName="active"><span className="header-link">O-C Gate</span></NavLink>
                        <NavLink to="/czev" activeClassName="active"><span className="header-link">CzeV</span></NavLink>
                        <NavLink to="/brno" activeClassName="active"><span className="header-link">B.R.N.O.</span></NavLink>
                        <NavLink to="/predictions" activeClassName="active"><span className="header-link">Predictions</span></NavLink>
                    </div>
                    <Redirect from="/" to="oc" />
                    <Route path="/oc" component={OcGate}/>
                    <Route path="/czev" component={Czev}/>
                    <Route path="/brno" component={Brno}/>
                    <Route path="/predictions" component={Predictions}/>
                </div>
            </Router>
        );
    }
}

class OcGate extends Component {
    constructor(props) {
        super(props);
        this.state = {constellations: [], stars: [], selectedStar: null, selectedElement: 'server'};
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
            this.setState({...this.state, selectedStar: value, starLoading: false, selectedElement: 'server'});
        });
    }

    render() {
        return (
            <div className="oc-gate-app">
                <div className="sidebar-wrapper">
                    <div className="sidebar">
                        <ConstellationList constellations={this.state.constellations} onSelected={constellation => this.onConstellationSelected(constellation)} loading={this.state.constellationsLoading}/>
                    </div>
                    <div className="sidebar">
                        <StarList stars={this.state.stars} onSelected={star => this.onStarSelected(star)} loading={this.state.starsLoading}/>
                    </div>
                </div>
                <div className="stars-detail-wrapper">
                    <StarDetail selectedElement={this.state.selectedElement} star={this.state.selectedStar} loading={this.state.starLoading} onElementChange={(element) => {
                        this.setState({...this.state, selectedElement: element})
                    }}/>
                </div>
            </div>
        );
    }
}

class Czev extends Component {
    render() {
        return (
            <div>This will be new czev catalog!</div>
        )
    }
}

class Brno extends Component {
    render() {
        return (
            <div></div>
        );
    }
}

class Predictions extends Component {
    render() {
        return (
            <div></div>
        )
    }
}

export default App;
