import React, {Component} from "react";
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";
import {Card, Col, DatePicker, Icon, Layout, Popover, Row, Spin, Table} from "antd";
import {CoordsInput, TableInputFilter, TableInputNumberFilter, TableInputRangeFilter} from "../../App";
import moment from "moment";
import {PredictionsVirtualizedList} from "./PredictionsVirtualizedList";
import {addUrlProps, UrlQueryParamTypes} from 'react-url-query';

import "./Predictions.css";
import {UserProfileConsumer} from "../common/UserProfileContext";
import {Link} from "react-router-dom";
import {PredictionsMinimaGraph} from "./PredictionsMinimaGraph";
import {CoordinateWrapper} from "../common/CoordinateWrapper";
import {AnchorButton} from "../common/AnchorButton";

const urlPropsQueryConfig = {
    date: {type: UrlQueryParamTypes.string},
};

// class SessionCache {
//     constructor() {
//     }
// }

class PredictionsPage extends Component {
    static columns = [
        {
            title: 'Star',
            dataIndex: 'name',
            filterDropdown: (actions) => (
                <TableInputFilter actions={actions}/>
            ),
            width: 200,
            render: (record) => {
                return (<span>
                <Link target="_blank"
                      to={"/oc/" + record.constellationId + "/" + record.starId}>{record.name}</Link>
                                            <Popover
                                                key={record.element.id}
                                                overlayClassName="popover-minima-graph"
                                                content={(<PredictionsMinimaGraph element={record.element}/>)}
                                            >
                                                <Icon
                                                    style={{
                                                        verticalAlign: "-0.25em",
                                                        paddingLeft: 2
                                                    }}
                                                    type="dot-chart"
                                                    className="clickable-icon"/>
                                            </Popover>
            </span>)
            }
        },
        {
            title: 'P/S',
            dataIndex: 'element.kind.name',
            width: 40,
            render: record => record.element.kind.name,
        },
        {
            title: 'Time',
            dataIndex: 'minimumDateTime',
            width: 60,
            itemProps: (record) => {
                return {title: `${record.minimumDateTime} (${record.minimum})`}
            },
            render: (record) => record.minimumDateTime.format("HH:mm")
        },
        {
            title: 'Pts',
            dataIndex: 'points',
            width: 70,
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
            title: 'Al.',
            dataIndex: 'altitude',
            width: 60,
            filterDropdown: (actions) => (
                <TableInputRangeFilter actions={actions} degrees/>
            ),
            render: (record) => (<span>{Math.round(record.altitude)}&deg;</span>)
        },
        {
            title: 'Az.',
            dataIndex: 'azimuth',
            filters: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"].map(d => {
                return {
                    text: d,
                    value: d
                }
            }),
            width: 60
        },
        {
            title: 'D(h)',
            dataIndex: 'minimaDuration',
            width: 50
        },
        {
            title: 'Coordinates',
            dataIndex: 'coordinates',
            width: 200,
            render: (record) => (
                <span><CoordinateWrapper size="small" value={record.coordinates.raString}/>&nbsp;<CoordinateWrapper
                    size="small" value={record.coordinates.decString}/></span>)
        },
        // {
        //     title: 'Elements',
        //     dataIndex: 'elements',
        //     width: 200,
        //     // customStyle: {fontSize: "0.75rem"}
        // },
        {
            title: 'Magnitudes',
            dataIndex: 'magnitudes',
            filterDropdown: (actions) => (
                <TableInputRangeFilter actions={actions}/>
            ),
            noStyle: true,
            render: record => record.magnitudes.map(m => `${m.max}-${m.min} (${m.filter})`).join(", "),
            className: "predictions-list__magnitude-column"
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
            filters: [],
            filteredPredictions: []
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
            axios.get(BASE_URL + "/ocgate/predictions", {
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
                this.setState({...this.state, loading: false, predictionsResult: result.data, filteredPredictions: this.getFilteredPredictions(result.data.predictions, this.state.filters)});
            });
        }
    }

    handleOnDateChange = (dateString) => {
        if (dateString) {
            const fromCache = this.getFromCache(this.state.latitude, this.state.longitude, dateString);
            if (fromCache != null) {
                this.setState({...this.state, predictionsResult: fromCache, filteredPredictions: this.getFilteredPredictions(fromCache.predictions, this.state.filters)});
            } else {
                // this.setState({...this.state, date: dateString});
                this.loadPredictions(this.state.latitude, this.state.longitude, dateString);
            }
        }
    };

    handleCoordinatesChange = (latitude, longitude) => {
        if (latitude != null && longitude != null && (this.state.latitude !== latitude || this.state.longitude !== longitude)) {
            const fromCache = this.getFromCache(latitude, longitude, this.props.date);
            if (fromCache != null) {
                this.setState({...this.state, latitude, longitude, predictionsResult: fromCache, filteredPredictions: this.getFilteredPredictions(fromCache.predictions, this.state.filters)});
            } else {
                this.setState({...this.state, latitude, longitude});
                this.loadPredictions(latitude, longitude, this.props.date);
            }
        }
    };

    getFilteredPredictions = (predictions, filters) => {
        if (filters.name) {
            filters.name.forEach(value => {
                predictions = predictions.filter(p => p.name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
            });
        }
        if (filters.points) {
            filters.points.forEach(value => {
                predictions = predictions.filter(p => p.points === null || p.points >= value);
            });
        }
        if (filters.altitude) {
            filters.altitude.forEach(value => {
                predictions = predictions.filter(p => !(value.max && p.altitude > value.max) && !(value.min && p.altitude < value.min))

            });
        }
        if (filters.azimuth) {
            predictions = predictions.filter(p => filters.azimuth.indexOf(p.azimuth) !== -1);
        }
        if (filters.magnitudes) {
            filters.magnitudes.forEach(value => {
                predictions = predictions.filter(p => {
                    for (let i = 0; i < p.magnitudes.length; i++) {
                        const m = p.magnitudes[i];
                        if (!(value.max && m.min > value.max) && !(value.min && m.max < value.min)) {
                            return true;
                        }
                    }
                    return false;
                });
            });
        }
        return predictions
    };

    handleTableChange = (pagination, filters) => {
        this.setState({
            ...this.state, filters: filters,
            filteredPredictions: this.getFilteredPredictions(this.state.predictionsResult.predictions, filters)
        });
    };

    handleDownload = () => {
        const csv = this.state.filteredPredictions.map(p => [p.name, p.element.kind.name, p.minimumDateTime, p.minimum, p.points, p.altitude, p.azimuth, p.minimaDuration, p.coordinates.raString, p.coordinates.decString, p.magnitudes.map(m => `${m.max}-${m.min} (${m.filter})`).join(", ")].join(",")).join("\n");
        const pom = document.createElement('a');
        const blob = new Blob(["Star, P/S, Time, JD, Pts, Altitude, Azimuth, D(h), RA, DEC, Magnitudes\n" + csv], {type: 'text/csv;charset=utf-8;'});
        pom.href = URL.createObjectURL(blob);
        pom.setAttribute('download', `Predictions-${this.props.date}.csv`);
        pom.click();
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
                                            onChange={(date, dateString) => this.props.onChangeDate(dateString)}/>
                            </Col>
                            <Col span={24} sm={{span: 12}}>
                                <CoordsInput
                                    onSubmit={(val) => this.handleCoordinatesChange(val.latitude, val.longitude)}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24} sm={{span: 12}}>
                                {this.state.predictionsResult.nights.map((interval, index) => {
                                    return (
                                        <span
                                            key={index}>Nautical twilights: {interval.sunset} - {interval.sunrise}</span>
                                    )
                                })}
                            </Col>
                            <Col span={24} sm={{span: 12}}>
                                <AnchorButton icon="download" onClick={this.handleDownload}>Download</AnchorButton>
                            </Col>
                        </Row>
                        <div className="predictions-list__outer-wrapper" style={{flex: "1 1 auto", overflow: "auto"}}>
                            <div className="predictions-list__inner-wrapper" style={{flex: "0"}}>
                                <Table
                                    columns={PredictionsPage.columns}
                                    dataSource={[]}
                                    size={"small"}
                                    bordered={false}
                                    onChange={this.handleTableChange}
                                />
                            </div>
                            <div className="predictions-list__inner-wrapper">
                                <PredictionsVirtualizedList predictions={this.state.filteredPredictions}
                                                            columns={PredictionsPage.columns}/>
                            </div>
                        </div>
                    </Card>
                </Spin>
            </Layout.Content>
        )
    }
}

export const Predictions = addUrlProps({urlPropsQueryConfig})(PredictionsPage);
