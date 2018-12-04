import React, {Component, Fragment} from 'react';
import ConstellationList from "./components/ocgate/ConstellationList";
import {BASE_URL} from "./api-endpoint";
import StarList from "./components/ocgate/StarList";
import StarDetail from "./components/ocgate/StarDetail";
import {BrowserRouter as Router, Route, Redirect, NavLink, Switch, withRouter, Link} from "react-router-dom";
import Czev from "./components/czev/Czev";
import moment from 'moment';
import axios from "axios";

import "./App.css";
import "./components/ocgate/StarList.css";
import "antd/dist/antd.css";

import {
    Card,
    DatePicker,
    Input,
    InputNumber,
    Layout,
    Menu,
    Row,
    Spin,
    Table,
    Switch as ASwitch,
    Col,
    Button, Icon, Popover, Form
} from 'antd';
import ReactEcharts from "echarts-for-react";
import {AuthProvider, OnlyAdmin, OnlyAuth, AuthConsumer} from "./components/AuthContext";

const {Header, Content, Sider} = Layout;

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;

}, (error) => {
    // Do something with request error
    return Promise.reject(error);
});

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

class MinimalMinimaList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            failed: false,
            loading: false,
            data: []
        }
    }

    ocCalc = (m0, period, minima) => {
        let e = Math.round((minima - m0) / period);
        let oc = minima - (m0 + period * e);
        return oc.toFixed(5);
    };

    componentDidMount() {
        this.setState({...this.state, loading: true});
        axios.get(BASE_URL + "/oc/stars/" + this.props.id + "/minima", {
            params: {
                kind: this.props.kind
            }
        }).then(result => {
            const data = result.data.minima.map(minima => {
                const oc = this.ocCalc(result.data.m0, result.data.period, minima);
                const epoch = Math.round((minima - result.data.m0) / result.data.period);
                return [epoch, oc];
            });
            this.setState({...this.state, loading: false, data: data});
        }).catch(e => {
            this.setState({...this.state, failed: true});
        });
    }

    getChartOption(data) {
        return {
            title: {},
            tooltip: {
                show: false,
                trigger: 'none'
            },
            legend: {
                show: false,
            },
            grid: [
                {
                    right: 0, bottom: 25, left: 25, top: 10,
                },
            ],
            xAxis: {
                name: 'Epoch',
                type: 'value',
                scale: true,
            },
            yAxis: {
                name: 'O-C',
                type: 'value',
                scale: true,
            },
            animation: false,
            series: [{
                name: 'minimas',
                type: 'scatter',
                symbolSize: 8,
                data: data,
                itemStyle: {
                    color: '#1890ff'
                }
            }]
        };
    }

    render() {
        return (
            <Spin spinning={this.state.loading}>
            <span>
                <ReactEcharts
                    option={this.getChartOption(this.state.data)}
                    style={{
                        width: 400,
                        height: 300
                    }}
                />
            </span>
            </Spin>
        )
    }
}

class Predictions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            predictions: [],
            showElements: false,
            latitude: 50,
            longitude: 15,
            date: null
        };
        this.cache = {};
    }

    loadPredictions(latitude, longitude, dateString, cacheKey) {
        if (latitude != null && longitude != null && dateString != null && cacheKey != null) {
            this.setState(state => {
                return {...state, loading: true}
            });
            axios.get(BASE_URL + "/oc/predictions", {
                params: {
                    date: dateString,
                    latitude: latitude,
                    longitude: longitude
                }
            }).then(result => {
                this.cache[cacheKey] = result.data;
                this.setState({...this.state, loading: false, predictions: result.data});
            });
        }
    }

    handleOnChange = (date, dateString) => {
        if (dateString && this.state.date !== dateString) {
            const cacheKey = `${this.state.latitude} ${this.state.longitude} ${dateString}`;
            if (this.cache[cacheKey]) {
                this.setState({...this.state, date: dateString, predictions: this.cache[cacheKey]});
            } else {
                this.setState({...this.state, date: dateString});
                this.loadPredictions(this.state.latitude, this.state.longitude, dateString, cacheKey);
            }
        }
    };

    handleCoordinatesChange = (latitude, longitude) => {
        if (latitude != null && longitude != null && (this.state.latitude !== latitude || this.state.longitude !== longitude)) {
            const cacheKey = `${latitude} ${longitude} ${this.state.date}`;
            if (this.cache[cacheKey]) {
                this.setState({...this.state, latitude, longitude, predictions: this.cache[cacheKey]});
            } else {
                this.setState({...this.state, latitude, longitude});
                this.loadPredictions(latitude, longitude, this.state.date, cacheKey);
            }
        }
    };


    render() {
        const columns = [
            {
                title: 'Star',
                dataIndex: 'name',
                filterDropdown: (actions) => (
                    <TableInputFilter actions={actions}/>
                ),
                onFilter: (value, record) => record.name.toLowerCase().indexOf(value.toLowerCase()) !== -1,
                width: 200,
                render: (name, record) => (
                    <span><Link to="/oc">{name}</Link> <Popover
                        content={(<MinimalMinimaList id={record.id} kind={record.kind}/>)}><Icon
                        type="dot-chart" className="clickable-icon"/></Popover></span>
                )
            },
            {
                title: 'P/S',
                dataIndex: 'kind',
                width: 40
            },
            {
                title: 'Time',
                dataIndex: 'minimumDateTime',
                defaultSortOrder: 'ascend',
                sorter: (a, b) => a.minimum - b.minimum,
                render: (dt, record) => {
                    return (<span title={`${dt} (${record.minimum})`}>{dt.split(' ')[1]}</span>)
                },
                width: 100
            },
            {
                title: 'Points',
                dataIndex: 'points',
                width: 80,
                filterDropdown: (actions) => (
                    <TableInputNumberFilter actions={actions} label="Min" defaultValue={5}/>
                ),
                onFilter: (value, record) => record.points == null || record.points >= value
            },
            {
                title: 'Altitude',
                dataIndex: 'altitude',
                render: (alt) => (<span>{alt.toFixed(2)}&deg;</span>),
                width: 90,
                filterDropdown: (actions) => (
                    <TableInputRangeFilter actions={actions} degrees/>
                ),
                onFilter: (value, record) => !(value.max && record.altitude > value.max) && !(value.min && record.altitude < value.min)
            },
            {
                title: 'Azimuth',
                dataIndex: 'azimuth',
                filters: ["N", "NE", "SE", "S", "SW", "W", "NW"].map(d => {
                    return {
                        text: d,
                        value: d
                    }
                }),
                onFilter: (value, record) => record.azimuth === value,
                width: 100
            },
            {
                title: 'Magnitudes',
                dataIndex: 'magnitudes',
                render: (magnitudes) => {
                    return magnitudes.map(m => `${m.max}-${m.min} (${m.filter})`).join(", ")
                },
                filterDropdown: (actions) => (
                    <TableInputRangeFilter actions={actions}/>
                ),
                onFilter: (value, record) => {
                    for (let i = 0; i < record.magnitudes.length; i++) {
                        const m = record.magnitudes[i];
                        if (!(value.max && m.min > value.max) && !(value.min && m.max < value.min)) {
                            return true;
                        }
                    }
                    return false;
                }
            }
        ];
        if (this.state.showElements) {
            columns.push({
                title: 'Elements',
                dataIndex: 'elements'
            });
        }
        return (
            <Layout.Content style={{margin: "24px 24px 0"}}>
                <Spin spinning={this.state.loading}>
                    <Card>
                        <Row style={{marginBottom: 12}} gutter={4}>
                            <Col span={24} sm={{span: 8}}>
                                <label>Night of: </label>
                                <DatePicker allowClear={false}
                                            disabledDate={(current) => current < moment().startOf('day').subtract(1, 'day')}
                                            showToday
                                            onChange={this.handleOnChange}/>
                            </Col>
                            <Col span={24} sm={{span: 8}}>
                                <CoordsInput
                                    onSubmit={(val) => this.handleCoordinatesChange(val.latitude, val.longitude)}/>
                            </Col>
                            <Col span={24} sm={{span: 8}}>
                                <span><ASwitch
                                    onChange={(checked) => this.setState({...this.state, showElements: checked})}/><span
                                    style={{marginLeft: 4}}>Show elements</span></span>
                            </Col>
                        </Row>
                        <Table
                            scroll={{x: 800}} size="small" rowKey={(r) => `${r.id}@${r.kind}@${r.minimum}`}
                            columns={columns}
                            dataSource={this.state.predictions}
                            pagination={{pageSize: 100, position: "both", showQuickJumper: true}}/>
                    </Card>
                </Spin>
            </Layout.Content>
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
