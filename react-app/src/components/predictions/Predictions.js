import React, {Component} from "react";
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";
import {Link} from "react-router-dom";
import {Card, Col, DatePicker, Icon, Popover, Row, Spin, Switch as ASwitch, Table, Layout} from "antd";
import moment from "moment";
import {CoordsInput, TableInputFilter, TableInputNumberFilter, TableInputRangeFilter} from "../../App";
import ReactEcharts from "echarts-for-react";

export class Predictions extends Component {
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
                    <span><Link to="/oc">{name}</Link> <Popover overlayClassName="popover-minima-graph"
                        content={(<MinimalMinimaGraph id={record.id} kind={record.kind}/>)}><Icon
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
                width: 90,
                filterDropdown: (actions) => (
                    <TableInputNumberFilter actions={actions} label="Min" defaultValue={5}/>
                ),
                onFilter: (value, record) => record.points == null || record.points >= value
            },
            {
                title: 'Altitude',
                dataIndex: 'altitude',
                render: (alt) => (<span>{alt.toFixed(2)}&deg;</span>),
                width: 100,
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

class MinimalMinimaGraph extends Component {
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
            title: {
                show: false
            },
            tooltip: {
                show: false,
                trigger: 'none'
            },
            legend: {
                show: false,
            },
            grid: [
                {
                    right: 15, bottom: 35, left: 45, top: 15,
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
