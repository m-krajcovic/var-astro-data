import React, {Component} from "react";
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";
import {Card, Col, DatePicker, Layout, Row, Spin, Table, Tag} from "antd";
import {CoordsInput, TableInputFilter, TableInputNumberFilter, TableInputRangeFilter} from "../../App";
import moment from "moment";
import {PredictionsVirtualizedList} from "./PredictionsVirtualizedList";
import {addUrlProps, UrlQueryParamTypes} from 'react-url-query';

import "./Predictions.css";
import {UserProfileConsumer} from "../common/UserProfileContext";

const urlPropsQueryConfig = {
    date: {type: UrlQueryParamTypes.string},
};

// TODO: state in url (date, lat, long)
class PredictionsPage extends Component {
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

    static defaultProps = {
        date: moment().format("YYYY-MM-DD"),
    };

    // static propTypes = {
    //     date: PropTypes.string,
    //     onChangeDate: PropTypes.func,
    // };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            predictionsResult: {predictions: [], nights: []},
            showElements: false,
            latitude: 50,
            longitude: 15,
            // date: null,
            filters: [],
        };
    }

    componentDidMount() {
        this.handleOnDateChange(this.props.date);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.date !== this.props.date) {
            this.handleOnDateChange(this.props.date);
        }
    }

    getCacheKey = (lat, lon, date) => {
        return `predictions#${lat}#${lon}#${date}`
    };

    getFromCache = (lat, lon, date) => {
        return this.getFromCacheWithKey(this.getCacheKey(lat, lon, date))
    };

    getFromCacheWithKey = (cacheKey) => {
        const fromCache = sessionStorage.getItem(cacheKey);
        if (fromCache != null) {
            return this.parseFromCache(fromCache);
        }
        return null;
    };

    parseFromCache = (fromCache) => {
        const data = JSON.parse(fromCache).data;
        data.predictions.forEach(r => {
            r.minimumDateTime = moment(r.minimumDateTime);
        });
        return data;
    };

    saveToCache = (lat, lon, date, data) => {
        const queueString = sessionStorage.getItem("predictions_queue");
        let queue = [];
        if (queueString != null) {
            queue = JSON.parse(queueString);
        }

        let cacheKey = this.getCacheKey(lat, lon, date);
        queue.push(cacheKey);
        for (let i = 0; i < 5; i++) {
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify({timestamp: Date(), data: data}));
                sessionStorage.setItem("predictions_queue", JSON.stringify(queue));
                break;
            } catch (e) {
                if (queue.length > 0) {
                    const toDelete = queue[0];
                    sessionStorage.removeItem(toDelete);
                    queue = queue.splice(1);
                } else {
                    break;
                }
            }
        }
    };

    loadPredictions(latitude, longitude, dateString) {
        if (latitude != null && longitude != null && dateString != null) {
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
                this.saveToCache(latitude, longitude, dateString, result.data);
                this.setState({...this.state, loading: false, predictionsResult: result.data});
            });
        }
    }

    handleOnDateChange = (dateString) => {
        if (dateString) {
            const fromCache = this.getFromCache(this.state.latitude, this.state.longitude, dateString);
            if (fromCache != null) {
                this.setState({...this.state, date: dateString, predictionsResult: fromCache});
            } else {
                this.setState({...this.state, date: dateString});
                this.loadPredictions(this.state.latitude, this.state.longitude, dateString);
            }
            this.props.onChangeDate(dateString);
        }
    };

    handleCoordinatesChange = (latitude, longitude) => {
        if (latitude != null && longitude != null && (this.state.latitude !== latitude || this.state.longitude !== longitude)) {
            const fromCache = this.getFromCache(latitude, longitude, this.props.date);
            if (fromCache != null) {
                this.setState({...this.state, latitude, longitude, predictionsResult: fromCache});
            } else {
                this.setState({...this.state, latitude, longitude});
                this.loadPredictions(latitude, longitude, this.props.date);
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
                                            value={moment(this.props.date)}
                                            onChange={(date, dateString) => this.handleOnDateChange(dateString)}/>
                            </Col>
                            <Col span={24} sm={{span: 12}}>
                                <CoordsInput
                                    onSubmit={(val) => this.handleCoordinatesChange(val.latitude, val.longitude)}/>
                            </Col>
                        </Row>
                        <Row>
                            {this.state.predictionsResult.nights.map((interval, index) => {
                                return (
                                    <span key={index}>Nautical twilights: {interval.sunset} - {interval.sunrise}</span>
                                )
                            })}
                        </Row>
                        <div className="predictions-list__outer-wrapper" style={{flex: "1 1 auto", overflow: "auto"}}>
                            <div className="predictions-list__inner-wrapper" style={{flex: "0"}}>
                                <Table
                                    columns={PredictionsPage.columns}
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

export const Predictions = addUrlProps({urlPropsQueryConfig})(PredictionsPage);
