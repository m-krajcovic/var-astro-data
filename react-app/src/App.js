import React, {Component, Fragment} from 'react';
import ConstellationList from "./components/ocgate/ConstellationList";
import {BASE_URL} from "./api-endpoint";
import StarList from "./components/ocgate/StarList";
import StarDetail from "./components/ocgate/StarDetail";
import {BrowserRouter as Router, Link, NavLink, Redirect, Route, Switch, withRouter} from "react-router-dom";
import Czev from "./components/czev/Czev";
import axios from "axios";

import "./App.css";
import "./components/ocgate/StarList.css";
import "antd/dist/antd.css";

import {Button, Card, Col, Form, Icon, Input, InputNumber, Layout, Menu, Row, Spin} from 'antd';
import ReactEcharts from "echarts-for-react";
import {AuthConsumer, AuthProvider, OnlyAdmin, OnlyAuth} from "./components/AuthContext";
import "./components/http"
import {Predictions} from "./components/predictions/Predictions";

const {Header, Content, Sider} = Layout;

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
                <Menu.SubMenu className="ant-menu-item" title={<NavLink to="/czev">CzeV</NavLink>}>
                    <Menu.Item key="/czev">
                        <NavLink to="/czev">Catalogue</NavLink>
                    </Menu.Item>
                    <OnlyAuth>
                        <Menu.SubMenu title="User">
                            <Menu.Item key="/czev/user/drafts">
                                <NavLink to="/czev/user/drafts">Drafts</NavLink>
                            </Menu.Item>
                        </Menu.SubMenu>
                    </OnlyAuth>
                    <OnlyAdmin>
                        <Menu.SubMenu title="Admin">
                            <Menu.Item key="/czev/admin/drafts">
                                <NavLink to="/czev/admin/drafts">Drafts</NavLink>
                            </Menu.Item>
                        </Menu.SubMenu>
                    </OnlyAdmin>
                </Menu.SubMenu>
                <Menu.Item key="/predictions">
                    <NavLink to="/predictions">Predictions</NavLink>
                </Menu.Item>
            </Menu>
        );
    }
);

class App extends Component {
    render() {
        return (
            <Router>
                <AuthProvider>
                    <Layout className="layout" style={{minHeight: "100vh"}}>
                        <Header style={{width: "100%"}}>
                            <Row>
                                <Col span={20}>
                                    <LinkMenu/>
                                </Col>
                                <Col span={4} style={{textAlign: "right"}}>
                                    <AuthConsumer>
                                        {({logout, isAuth}) => {
                                            return isAuth ? (
                                                <Link to="/logout">Log out</Link>
                                            ) : (
                                                <Link to="/login">Log in</Link>
                                            )
                                        }}
                                    </AuthConsumer>
                                </Col>
                            </Row>
                        </Header>
                        <Switch>
                            <Route exact path="/logout" component={Logout}/>
                            <Route exact path="/login" component={Login}/>
                            <Route exact path="/oc" component={OcGate}/>
                            <Route exact path="/predictions" component={Predictions}/>
                            <Route path="/czev" component={Czev}/>
                            <Redirect to="/czev"/>
                        </Switch>
                    </Layout>
                </AuthProvider>
            </Router>
        );
    }
}

class Logout extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Fragment>
                <AuthConsumer>
                    {({logout}) => {
                        logout()
                    }}
                </AuthConsumer>
                <Redirect to="/czev"/>
            </Fragment>
        )
    }
}

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {username: '', password: ''};
    }

    render() {
        return (
            <Content style={{margin: "24px 24px 0"}}>
                <Card>
                    <Col offset={9} span={6}>
                        <Form.Item label="E-mail">
                            <Input type="text" value={this.state.username}
                                   onChange={(e) => this.setState({...this.state, username: e.target.value})}/>
                        </Form.Item>
                        <Form.Item label="Password">
                            <Input type="password" value={this.state.password}
                                   onChange={(e) => this.setState({...this.state, password: e.target.value})}/>
                        </Form.Item>
                        <AuthConsumer>
                            {({login}) => (
                                <Button type="primary" onClick={() => {
                                    login(this.state.username, this.state.password)
                                        .then(result => {
                                            this.props.history.goBack();
                                        })
                                }}>Log in</Button>
                            )}
                        </AuthConsumer>
                    </Col>
                </Card>
            </Content>
        )
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

export class CoordsInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            latitude: 50,
            longitude: 15,
            editting: false
        };
    }

    handleButtonClick = () => {
        this.setState({...this.state, editting: false});
        this.props.onSubmit({longitude: this.state.longitude, latitude: this.state.latitude});
    };

    render() {
        if (this.state.editting) {
            return (
                <Row style={{
                    maxWidth: 400,
                }}>
                    <Col span={8} gutter={4}>
                        <label>Lat: </label>
                        <InputNumber
                            formatter={value => `${value}°`}
                            parser={value => value.replace('°', '')}
                            value={this.state.latitude}
                            onChange={(val) => this.setState({...this.state, latitude: val})}
                            placeholder="latitude"/>
                    </Col>
                    <Col span={8}>
                        <label>Lon: </label>
                        <InputNumber
                            formatter={value => `${value}°`}
                            parser={value => value.replace('°', '')}
                            value={this.state.longitude}
                            onChange={(val) => this.setState({...this.state, longitude: val})}
                            placeholder="longitude"/>
                    </Col>
                    <Col span={8}>
                        <Button style={{height: 32}} htmlType="button" onClick={this.handleButtonClick}>Set</Button>
                    </Col>
                </Row>
            )
        }
        return (
            <Row style={{
                maxWidth: 400,
                lineHeight: "32px"
            }}>
                <span style={{marginRight: 4}}>Lat: {this.state.latitude}&deg;</span>
                <span style={{marginRight: 4}}>Lon: {this.state.longitude}&deg;</span>
                <Icon className="clickable-icon blue" type="edit"
                      onClick={() => this.setState({...this.state, editting: true})}/>
            </Row>
        )
    }
}

export class TableInputFilter extends Component {

    constructor(props) {
        super(props);
    }

    handleOk = () => {
        this.props.actions.confirm();
    };

    handleReset = () => {
        this.props.actions.clearFilters();
    };

    render() {
        return (
            <div className="ant-table-filter-dropdown">
                <div style={{padding: 4}}>
                    <Input
                        placeholder="Filter..."
                        value={this.props.actions.selectedKeys[0]}
                        onChange={e => this.props.actions.setSelectedKeys([e.target.value])}/>
                </div>
                <div className="ant-table-filter-dropdown-btns"><a
                    className="ant-table-filter-dropdown-link confirm" onClick={this.handleOk}>OK</a><a
                    className="ant-table-filter-dropdown-link clear" onClick={this.handleReset}>Reset</a>
                </div>
            </div>
        )
    }
}

export class TableInputNumberFilter extends Component {

    constructor(props) {
        super(props);
        if (this.props.defaultValue) {
            this.props.actions.setSelectedKeys([this.props.defaultValue]);
            this.props.actions.confirm();
        }
    }

    handleOk = () => {
        this.props.actions.confirm();
    };

    handleReset = () => {
        this.props.actions.clearFilters();
    };

    render() {
        return (
            <div className="ant-table-filter-dropdown">
                <div style={{padding: 4}}>
                    <label style={{marginRight: 4}}>{this.props.label}:</label>
                    <InputNumber
                        value={this.props.actions.selectedKeys[0]}
                        onChange={value => this.props.actions.setSelectedKeys([value])}/>
                </div>
                <div className="ant-table-filter-dropdown-btns"><a
                    className="ant-table-filter-dropdown-link confirm" onClick={this.handleOk}>OK</a><a
                    className="ant-table-filter-dropdown-link clear" onClick={this.handleReset}>Reset</a>
                </div>
            </div>
        )
    }
}

export class TableInputRangeFilter extends Component {

    constructor(props) {
        super(props);
    }

    handleOk = () => {
        this.props.actions.confirm();
    };

    handleReset = () => {
        this.props.actions.clearFilters();
    };

    render() {
        return (
            <div className="ant-table-filter-dropdown">
                <div style={{padding: 4}}>
                    <label style={{marginRight: 4}}>Min:</label>
                    <InputNumber
                        formatter={this.props.degrees ? value => `${value}°` : value => value}
                        parser={this.props.degrees ? value => value.replace('°', '') : value => value}
                        value={this.props.actions.selectedKeys[0] ? this.props.actions.selectedKeys[0].min : null}
                        onChange={val => this.props.actions.setSelectedKeys([{
                            min: val,
                            max: this.props.actions.selectedKeys[0] ? this.props.actions.selectedKeys[0].max : null
                        }])}
                    />
                    <label style={{marginRight: 4, marginLeft: 4}}>Max:</label>
                    <InputNumber
                        formatter={this.props.degrees ? value => `${value}°` : value => value}
                        parser={this.props.degrees ? value => value.replace('°', '') : value => value}
                        value={this.props.actions.selectedKeys[0] ? this.props.actions.selectedKeys[0].max : null}
                        onChange={val => this.props.actions.setSelectedKeys([{
                            min: this.props.actions.selectedKeys[0] ? this.props.actions.selectedKeys[0].min : null,
                            max: val,
                        }])}
                    />
                </div>
                <div className="ant-table-filter-dropdown-btns"><a
                    className="ant-table-filter-dropdown-link confirm" onClick={this.handleOk}>OK</a><a
                    className="ant-table-filter-dropdown-link clear" onClick={this.handleReset}>Reset</a>
                </div>
            </div>
        )
    }
}


export default App;