import React, {Component} from 'react';
// import './App.css';
// import './components/ocgate/StarList.css';
import ConstellationList from "./components/ocgate/ConstellationList";
import {BASE_URL} from "./api-endpoint";
import StarList from "./components/ocgate/StarList";
import StarDetail from "./components/ocgate/StarDetail";
import {BrowserRouter as Router, Route, Redirect, NavLink, Switch, withRouter} from "react-router-dom";
import Czev from "./components/czev/Czev";


import "./App.css"
import "antd/dist/antd.css";

import {Layout, Menu, Breadcrumb} from 'antd';

const {Header, Content, Footer} = Layout;

const LinkMenu = withRouter(props => {
        const {location} = props;
        return (
            <Menu
                theme="dark"
                mode="horizontal"
                style={{lineHeight: '64px'}}
                selectedKeys={[location.pathname]}
            >
                <Menu.Item key="/oc">
                    <NavLink to="/oc"><span className="header-link">O-C Gate</span></NavLink>
                </Menu.Item>
                <Menu.Item key="/czev">
                    <NavLink to="/czev"><span className="header-link">CzeV</span></NavLink>
                </Menu.Item>
            </Menu>
        );
    }
);

class App extends Component {
    render() {
        return (
            <Router>
                <Layout className="layout">
                    <Header style={{position: 'fixed', zIndex: 1, width: '100%'}}>
                        <LinkMenu/>
                    </Header>
                    <Content style={{marginTop: 64}}>
                        <Switch>
                            <Route path="/oc" component={OcGate}/>
                            <Route path="/czev" component={Czev}/>
                            <Route path="/brno" component={Brno}/>
                            <Route path="/predictions" component={Predictions}/>
                            <Redirect to="/oc"/>
                        </Switch>
                    </Content>
                    <Footer style={{textAlign: 'center'}}>
                        Michal Krajčovič ©2018
                    </Footer>
                </Layout>
                {/*<div className="app">*/}
                {/*<div className="app-header">*/}
                {/*<NavLink to="/oc" activeClassName="active"><span className="header-link">O-C Gate</span></NavLink>*/}
                {/*<NavLink to="/czev" activeClassName="active"><span className="header-link">CzeV</span></NavLink>*/}
                {/*<NavLink to="/brno" activeClassName="active"><span className="header-link">B.R.N.O.</span></NavLink>*/}
                {/*<NavLink to="/predictions" activeClassName="active"><span className="header-link">Predictions</span></NavLink>*/}
                {/*</div>*/}
                {/*<Route exact path="/oc" component={OcGate}/>*/}
                {/*<Route path="/czev" component={Czev}/>*/}
                {/*<Route path="/brno" component={Brno}/>*/}
                {/*<Route path="/predictions" component={Predictions}/>*/}
                {/*<Redirect from="/" to="oc" />*/}
                {/*</div>*/}
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
        fetch(BASE_URL + "/oc/constellations").then(response => response.json())
            .then(value => this.setState({
                constellations: value,
                stars: [],
                selectedStar: null,
                constellationsLoading: false
            }));
    }

    onConstellationSelected(constellation) {
        this.setState({...this.state, starsLoading: true});
        fetch(BASE_URL + "/oc/constellations/" + constellation + "/stars").then(response => response.json())
            .then(value => this.setState({...this.state, stars: value, starsLoading: false}));
    }

    onStarSelected(star) {
        this.setState({...this.state, starLoading: true});
        fetch(BASE_URL + "/oc/stars/" + star.starId).then(response => response.json()).then(value => {
            this.setState({...this.state, selectedStar: value, starLoading: false, selectedElement: 'server'});
        });
    }

    render() {
        return (
            <div className="oc-gate-app">
                <div className="sidebar-wrapper">
                    <div className="sidebar">
                        <ConstellationList constellations={this.state.constellations}
                                           onSelected={constellation => this.onConstellationSelected(constellation)}
                                           loading={this.state.constellationsLoading}/>
                    </div>
                    <div className="sidebar">
                        <StarList stars={this.state.stars} onSelected={star => this.onStarSelected(star)}
                                  loading={this.state.starsLoading}/>
                    </div>
                </div>
                <div className="stars-detail-wrapper">
                    <StarDetail selectedElement={this.state.selectedElement} star={this.state.selectedStar}
                                loading={this.state.starLoading} onElementChange={(element) => {
                        this.setState({...this.state, selectedElement: element})
                    }}/>
                </div>
            </div>
        );
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
