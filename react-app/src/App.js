import React, {Component, Fragment} from 'react';
import ConstellationList from "./components/ocgate/ConstellationList";
import {BASE_URL} from "./api-endpoint";
import StarList from "./components/ocgate/StarList";
import StarDetail from "./components/ocgate/StarDetail";
import {BrowserRouter as Router, Link, NavLink, Redirect, Route, Switch, withRouter} from "react-router-dom";
import Czev from "./components/czev/Czev";
import axios from "axios";

// import 'react-virtualized/styles.css'
import "./App.css";
import "./components/ocgate/StarList.css";
import "antd/dist/antd.css";

import {
    Button,
    Card,
    Col,
    Form,
    Icon,
    Input,
    InputNumber,
    Layout,
    Menu,
    notification,
    Row
} from 'antd';
import {AuthConsumer, AuthProvider, OnlyAdmin, OnlyAuth} from "./components/AuthContext";
import "./components/http"
import {Predictions} from "./components/predictions/Predictions";
import {UserProfileProvider} from "./components/common/UserProfileContext";
import {RouterToUrlQuery} from "react-url-query";
import AdminPage from "./components/admin/AdminPage";
import {ObservationsProvider} from "./components/ocgate/ObservationsContext";
import {AnchorButton} from "./components/common/AnchorButton";
import {MinimaPublicationsProvider} from "./components/common/MinimaPublicationsContext";

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
                selectedKeys={selectedKeys}
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
                <RouterToUrlQuery>
                    <MinimaPublicationsProvider>
                        <UserProfileProvider>
                            <AuthProvider>
                                <ObservationsProvider>
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
                                                                <>
                                                                    <Link style={{marginRight: 8}} to="/login">Log
                                                                        in</Link>
                                                                    <Link to="/register">Register</Link>
                                                                </>
                                                            )
                                                        }}
                                                    </AuthConsumer>
                                                </Col>
                                            </Row>
                                        </Header>
                                        <AuthConsumer>
                                            {({isAuth, isAdmin}) =>
                                                (
                                                    <Switch>
                                                        {isAuth && (
                                                            <Route exact path="/logout" component={Logout}/>
                                                        )}
                                                        {!isAuth && (
                                                            <Route exact path="/login" component={Login}/>
                                                        )}
                                                        {!isAuth && (
                                                            <Route exact path="/register" component={Register}/>
                                                        )}
                                                        <Route path="/oc/:const?/:star?" component={OcGate}/>
                                                        <Route exact path="/predictions" component={Predictions}/>
                                                        <Route path="/czev" component={Czev}/>
                                                        {isAdmin && (
                                                            <Route path="/admin" component={AdminPage}/>
                                                        )}
                                                        <Redirect to="/czev"/>
                                                    </Switch>
                                                )
                                            }
                                        </AuthConsumer>
                                    </Layout>
                                </ObservationsProvider>
                            </AuthProvider>
                        </UserProfileProvider>
                    </MinimaPublicationsProvider>
                </RouterToUrlQuery>
            </Router>
        );
    }
}

class Logout extends Component {
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

class RegisterComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {registered: false};
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const component = this;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                axios.post(BASE_URL + "/auth/signup", values)
                    .then(result => {
                        notification.success({
                            message: 'Successfully registered. You can log in now.'
                        });
                        component.setState({...this.state, registered: true});
                    }).catch(e => {
                    notification.error({
                        message: 'Failed to register. Please try again.',
                        description: e.response.data.message,
                    })
                });
            }
        });
    };

    render() {
        if (this.state.registered) {
            return (
                <Redirect to="/login"/>
            )
        }
        const {getFieldDecorator} = this.props.form;
        return (
            <Content style={{margin: "24px 24px 0"}}>
                <Card>
                    <Col offset={9} span={6}>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Item label="First name">
                                {getFieldDecorator('firstName', {})(
                                    <Input/>
                                )}
                            </Form.Item>
                            <Form.Item label="Last name">
                                {getFieldDecorator('lastName', {})(
                                    <Input/>
                                )}
                            </Form.Item>
                            <Form.Item label="E-mail">
                                {getFieldDecorator('email', {
                                    rules: [{
                                        type: "email", message: "The input is not a valid email"
                                    }],
                                })(
                                    <Input/>
                                )}
                            </Form.Item>
                            <Form.Item label="Password">
                                {getFieldDecorator('password', {
                                    rules: [],
                                })(
                                    <Input type="password"/>
                                )}
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">Register</Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Card>
            </Content>
        )
    }
}

const Register = Form.create()(RegisterComponent);

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
        this.state = {
            constellations: [],
            stars: [],
            selectedStar: null,
            selectedElement: 'server',
            starLoading: false,
            starsLoading: false,
            constellationsLoading: false,
            selectedConstellationName: null,
            selectedStarName: null,
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps.match.params) {
            // router params changed
            const constName = nextProps.match.params["const"];
            const starName = nextProps.match.params["star"];

            if (constName !== this.state.selectedConstellationName) { // if const param has changed
                this.onConstellationSelected(constName, starName); // load stars & star detail if needed
                this.setState((s) => { // update selected const for future checks
                    return {...s, selectedConstellationName: constName, selectedStarName: null};
                })
            } else if (starName !== this.state.selectedStarName) { // only starname has changed
                this.onStarSelected(starName); // load details for given star
                this.setState(s => {
                    return {...s, selectedStarName: starName};
                });
            }
        }
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

    onConstellationSelected(constellation, starName) {
        this.setState({...this.state, starsLoading: true});
        fetch(BASE_URL + "/oc/constellations/" + constellation + "/stars").then(response => response.json())
            .then(value => this.setState(state => {
                return {...state, stars: value, starsLoading: false}
            }))
            .then(_ => {
                if (starName) {
                    this.onStarSelected(starName)
                }
            });
    }

    onStarSelected(starName) {
        const star = this.state.stars.find(s => s.starName === starName);
        if (star) {
            this.setState({...this.state, starLoading: true});
            fetch(BASE_URL + "/oc/stars/" + star.starId).then(response => response.json()).then(value => {
                this.setState({...this.state, selectedStar: value, starLoading: false, selectedElement: 'server'});
            });
        }
    }

    render() {
        let selectedConstName = null;
        let selectedStarName = null;
        if (this.props.match.params) {
            selectedConstName = this.props.match.params["const"];
            selectedStarName = this.props.match.params["star"];
        }
        return (
            <Content>
                <Sider theme="light"
                       style={{overflow: 'auto', height: 'calc(100vh - 64px)', position: 'fixed', top: 64, left: 0}}>
                    <ConstellationList constellations={this.state.constellations}
                                       selectedConstellationName={selectedConstName}
                                       loading={this.state.constellationsLoading}/>
                </Sider>
                <Sider theme="light"
                       style={{overflow: 'auto', height: 'calc(100vh - 64px)', position: 'fixed', top: 64, left: 200}}>
                    <StarList stars={this.state.stars}
                              selectedStarName={selectedStarName}
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
                    maxWidth: 500,
                }}>
                    <Col span={8} gutter={4}>
                        <label>Latitude: </label>
                        <InputNumber
                            defaultValue={this.props.latitude}
                            formatter={value => `${value}°`}
                            parser={value => value.replace('°', '')}
                            value={this.state.latitude}
                            onChange={(val) => this.setState({...this.state, latitude: val})}
                            placeholder="latitude"/>
                    </Col>
                    <Col span={8}>
                        <label>Longitude: </label>
                        <InputNumber
                            formatter={value => `${value}°`}
                            parser={value => value.replace('°', '')}
                            defaultValue={this.props.longitude}
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
                <span style={{marginRight: 4}}>Latitude: {this.state.latitude}&deg;</span>
                <span style={{marginRight: 4}}>Longitude: {this.state.longitude}&deg;</span>
                <Icon className="clickable-icon blue" type="edit"
                      onClick={() => this.setState({...this.state, editting: true})}/>
            </Row>
        )
    }
}

export class TableInputFilter extends Component {

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
                <div className="ant-table-filter-dropdown-btns">
                    <AnchorButton
                        className="ant-table-filter-dropdown-link confirm"
                        onClick={this.handleOk}>OK</AnchorButton>
                    <AnchorButton
                        className="ant-table-filter-dropdown-link clear"
                        onClick={this.handleReset}>Reset</AnchorButton>
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
        if (this.props.onOk) {
            this.props.onOk(this.props.actions.selectedKeys[0]);
        }
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
                <div className="ant-table-filter-dropdown-btns">
                    <AnchorButton className="ant-table-filter-dropdown-link confirm"
                                  onClick={this.handleOk}>OK</AnchorButton>
                    <AnchorButton className="ant-table-filter-dropdown-link clear"
                                  onClick={this.handleReset}>Reset</AnchorButton>
                </div>
            </div>
        )
    }
}

export class TableInputRangeFilter extends Component {

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
                    <label style={{marginRight: 4}}>From:</label>
                    <InputNumber
                        formatter={this.props.degrees ? value => `${value}°` : value => value}
                        parser={this.props.degrees ? value => value.replace('°', '') : value => value}
                        value={this.props.actions.selectedKeys[0] ? this.props.actions.selectedKeys[0].min : null}
                        onChange={val => this.props.actions.setSelectedKeys([{
                            min: val,
                            max: this.props.actions.selectedKeys[0] ? this.props.actions.selectedKeys[0].max : null
                        }])}
                    />
                    <label style={{marginRight: 4, marginLeft: 4}}>To:</label>
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
                <div className="ant-table-filter-dropdown-btns"><AnchorButton
                    className="ant-table-filter-dropdown-link confirm"
                    onClick={this.handleOk}>OK</AnchorButton><AnchorButton
                    className="ant-table-filter-dropdown-link clear" onClick={this.handleReset}>Reset</AnchorButton>
                </div>
            </div>
        )
    }
}


export default App;
