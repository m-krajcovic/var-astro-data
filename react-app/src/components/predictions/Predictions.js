import React, {Component} from "react";
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";
import {Card, Col, DatePicker, Layout, Row, Spin, Table, Tag} from "antd";
import {CoordsInput, TableInputFilter, TableInputNumberFilter, TableInputRangeFilter} from "../../App";
import moment from "moment";
import {PredictionsVirtualizedList} from "./PredictionsVirtualizedList";


import "./Predictions.css";
import {UserProfileConsumer} from "../common/UserProfileContext";
import {AuthConsumer} from "../AuthContext";

// TODO: state in url (date, lat, long)
export class Predictions extends Component {
    static columns = [
        {
            title: 'Star',
            dataIndex: 'name',
            filterDropdown: (actions) => (
                <TableInputFilter actions={actions}/>
            ),
            width: 200,
        },
        {
            title: 'P/S',
            dataIndex: 'kind',
            width: 60
        },
        {
            title: 'Time',
            dataIndex: 'minimumDateTime',
            width: 100
        },
        {
            title: 'Points',
            dataIndex: 'points',
            width: 90,
            filterDropdown: (actions) => (
                <UserProfileConsumer>
                    {({config, updateConfig}) => {
                        return (
                            <TableInputNumberFilter actions={actions}
                                                    onOk={(val) => {
                                                        updateConfig({...config, predictionPoints: val})
                                                    }}
                                                    label="Min"
                                                    defaultValue={config.predictionPoints}/>
                        )
                    }}
                </UserProfileConsumer>
            )
        },
        {
            title: 'Altitude',
            dataIndex: 'altitude',
            width: 100,
            filterDropdown: (actions) => (
                <TableInputRangeFilter actions={actions} degrees/>
            ),
        },
        {
            title: 'Azimuth',
            dataIndex: 'azimuth',
            filters: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"].map(d => {
                return {
                    text: d,
                    value: d
                }
            }),
            width: 110
        },
        {
            title: 'Magnitudes',
            dataIndex: 'magnitudes',
            filterDropdown: (actions) => (
                <TableInputRangeFilter actions={actions}/>
            )
        }
    ];
    static cache = {};

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            predictionsResult: {predictions: [], nights: []},
            showElements: false,
            latitude: 50,
            longitude: 15,
            date: null,
            filters: [],
        };
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
                result.data.predictions.forEach(r => {
                    r.minimumDateTime = moment(r.minimumDateTime);
                });
                result.data.predictions = result.data.predictions.sort((a, b) => {
                    return a.minimumDateTime.diff(b.minimumDateTime);
                });
                Predictions.cache[cacheKey] = result.data;
                this.setState({...this.state, loading: false, predictionsResult: result.data});
            });
        }
    }

    handleOnDateChange = (date, dateString) => {
        if (dateString && this.state.date !== dateString) {
            const cacheKey = `${this.state.latitude} ${this.state.longitude} ${dateString}`;
            if (Predictions.cache[cacheKey]) {
                this.setState({...this.state, date: dateString, predictionsResult: Predictions.cache[cacheKey]});
            } else {
                this.setState({...this.state, date: dateString});
                this.loadPredictions(this.state.latitude, this.state.longitude, dateString, cacheKey);
            }
        }
    };

    handleCoordinatesChange = (latitude, longitude) => {
        if (latitude != null && longitude != null && (this.state.latitude !== latitude || this.state.longitude !== longitude)) {
            const cacheKey = `${latitude} ${longitude} ${this.state.date}`;
            if (Predictions.cache[cacheKey]) {
                this.setState({...this.state, latitude, longitude, predictionsResult: Predictions.cache[cacheKey]});
            } else {
                this.setState({...this.state, latitude, longitude});
                this.loadPredictions(latitude, longitude, this.state.date, cacheKey);
            }
        }
    };

    handleTableChange = (pagination, filters) => {
        this.setState({...this.state, filters: filters});
    };

    render() {
        return (
            <Layout.Content style={{margin: "24px", display: "flex"}}>
                <Spin spinning={this.state.loading} wrapperClassName={"predictions__spinner"}>
                    <Card style={{height: "100%", display: "flex", minHeight: 400, width: "100%"}}
                          bodyStyle={{display: "flex", flexDirection: "column", width: "100%"}}>
                        <Row style={{marginBottom: 12}} gutter={4}>
                            <Col span={24} sm={{span: 12}}>
                                <label>Night of: </label>
                                <DatePicker allowClear={false}
                                            showToday
                                            onChange={this.handleOnDateChange}/>
                            </Col>
                            <Col span={24} sm={{span: 12}}>
                                <CoordsInput
                                    onSubmit={(val) => this.handleCoordinatesChange(val.latitude, val.longitude)}/>
                            </Col>
                        </Row>
                        <Row>
                            {this.state.predictionsResult.nights.map(interval => {
                                return (
                                    <Tag>{interval.sunset} - {interval.sunrise}</Tag>
                                )
                            })}
                        </Row>
                        <div className="predictions-list__outer-wrapper" style={{flex: "1 1 auto", overflow: "auto"}}>
                            <div className="predictions-list__inner-wrapper" style={{flex: "0"}}>
                                <Table
                                    columns={Predictions.columns}
                                    dataSource={[]}
                                    bordered={false}
                                    onChange={this.handleTableChange}
                                />
                            </div>
                            <div className="predictions-list__inner-wrapper">
                                <PredictionsVirtualizedList predictions={this.state.predictionsResult.predictions}
                                                            filters={this.state.filters}/>
                            </div>
                        </div>
                    </Card>
                </Spin>
            </Layout.Content>
        )
    }
}

