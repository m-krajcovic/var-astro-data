import React, {Component} from 'react';
import ConstellationList from "./components/ocgate/ConstellationList";
import {BASE_URL} from "./api-endpoint";
import StarList from "./components/ocgate/StarList";
import StarDetail from "./components/ocgate/StarDetail";
import {BrowserRouter as Router, Route, Redirect, NavLink, Switch, withRouter} from "react-router-dom";
import Czev from "./components/czev/Czev";


import "./App.css"
import "antd/dist/antd.css";

import {Layout, Menu} from 'antd';
import CzevAdmin from "./components/czev/admin/CzevAdmin";
import CzevUser from "./components/czev/user/CzevUser";

const {Header, Content, Footer, Sider} = Layout;

const LinkMenu = withRouter(props => {
        const {location} = props;
        const pathSnippets = location.pathname.split("/").filter(i => i);
        const selectedKeys = pathSnippets.map((_, index) => `/${pathSnippets.slice(0, index + 1).join('/')}`);
        return (
            <Menu
                theme="dark"
                mode="horizontal"
                style={{lineHeight: '64px'}}
                selectedKeys={[selectedKeys[selectedKeys.length - 1]]}
            >
                <Menu.Item key="/oc">
                    <NavLink to="/oc"><span className="header-link">O-C Gate</span></NavLink>
                </Menu.Item>
                <Menu.SubMenu title={<NavLink to="/czev">CzeV</NavLink>}>
                    <Menu.Item key="/czev">
                        <NavLink to="/czev">Catalogue</NavLink>
                    </Menu.Item>
                    <Menu.SubMenu title="User">
                        <Menu.Item key="/czev/user/drafts">
                            <NavLink to="/czev/user/drafts">Drafts</NavLink>
                        </Menu.Item>
                    </Menu.SubMenu>
                    <Menu.SubMenu title="Admin">
                        <Menu.Item key="/czev/admin/drafts">
                            <NavLink to="/czev/admin/drafts">Drafts</NavLink>
                        </Menu.Item>
                    </Menu.SubMenu>
                </Menu.SubMenu>
            </Menu>
        );
    }
);

class App extends Component {
    render() {
        return (
            <Router>
                <Layout className="layout" style={{minHeight: "100vh"}}>
                    <Header style={{width: "100%"}}>
                        <LinkMenu/>
                    </Header>
                    <Switch>
                        <Route exact path="/oc" component={OcGate}/>
                        <Route exact path="/brno" component={Brno}/>
                        <Route exact path="/predictions" component={Predictions}/>
                        <Route exact path="/czev/admin" component={CzevAdmin}/>
                        <Route exact path="/czev/user" component={CzevUser}/>
                        <Route path="/czev" component={Czev}/>
                        <Redirect to="/czev"/>
                    </Switch>
                    <Footer style={{textAlign: 'center'}}>
                        ©2018
                    </Footer>
                </Layout>
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
            <Content>
                <Sider theme="light"
                       style={{overflow: 'auto', height: 'calc(100vh - 64px)', position: 'fixed', top: 64, left: 0}}>
                    <ConstellationList constellations={this.state.constellations}
                                       onSelected={constellation => this.onConstellationSelected(constellation)}
                                       loading={this.state.constellationsLoading}/>
                </Sider>
                <Sider theme="light"
                       style={{overflow: 'auto', height: 'calc(100vh - 64px)', position: 'fixed', top: 64, left: 200}}>
                    <StarList stars={this.state.stars} onSelected={star => this.onStarSelected(star)}
                              loading={this.state.starsLoading}/>
                </Sider>
                <div className="stars-detail-wrapper" style={{
                    overflow: 'auto',
                    height: 'calc(100vh - 64px)',
                    position: 'fixed',
                    top: 64,
                    left: 400,
                    right: 0
                }}>
                    <StarDetail selectedElement={this.state.selectedElement} star={this.state.selectedStar}
                                loading={this.state.starLoading} onElementChange={(element) => {
                        this.setState({...this.state, selectedElement: element})
                    }}/>
                </div>
            </Content>
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
