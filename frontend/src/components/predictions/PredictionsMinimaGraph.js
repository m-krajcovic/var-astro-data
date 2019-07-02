import React, {Component, Fragment} from "react";
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";
import {Radio, Spin} from "antd";
import ReactEcharts from "echarts-for-react";
import {jdToDate} from "../ocgate/StarDetail";
import {UserProfileConsumer} from "../common/UserProfileContext";

export class PredictionsMinimaGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            failed: false,
            loading: false,
            data: [],
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
                return [epoch, oc, minima, jdToDate(minima)];
            });
            this.setState({...this.state, loading: false, data: data});
        }).catch(e => {
            this.setState({...this.state, failed: true});
        });
    }

    static xAxisOptions = {
        'jd': {
            xIndex: 2,
            axisType: 'value'
        },
        'epoch': {
            xIndex: 0,
            axisType: 'value'
        },
        'date': {
            xIndex: 3,
            axisType: 'time'
        }
    };

    getChartOption(data, xAxisOptionKey) {
        const xAxisOption = PredictionsMinimaGraph.xAxisOptions[xAxisOptionKey];
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
            dataset: [{
                dimensions: ['epoch', 'oc', 'julianDate', 'date'],
                source: data
            }],
            grid: [
                {
                    right: 15, bottom: 35, left: 45, top: 15,
                },
            ],
            xAxis: {
                type: xAxisOption.axisType,
                scale: true,
                min: 'dataMin',
                max: 'dataMax',
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
                datasetIndex: 0,
                encode: {
                    x: xAxisOption.xIndex,
                    y: 1,
                    // tooltip: [1, 0, 2, 3]
                },
                itemStyle: {
                    color: '#1890ff'
                }
            }]
        };
    }

    render() {
        return (
            <Spin spinning={this.state.loading}>
                <div>
                    <UserProfileConsumer>
                        {({config, updateConfig}) => {
                            return (
                                <Fragment>
                                <Radio.Group defaultValue={config.xAxisOptionKey} size="small"
                                             style={{margin: "auto", width: 135, display: "block", paddingTop: 8}}
                                             onChange={(e) => {
                                                 // this.setState({
                                                 //         ...this.state,
                                                 //         xAxisOptionKey: e.target.value
                                                 //     }
                                                 // );
                                                 updateConfig({...config, xAxisOptionKey: e.target.value});
                                             }}>
                                    <Radio.Button value="epoch">Epoch</Radio.Button>
                                    <Radio.Button value="jd">JD</Radio.Button>
                                    <Radio.Button value="date">Date</Radio.Button>
                                </Radio.Group>
                    <ReactEcharts
                        option={this.getChartOption(this.state.data, config.xAxisOptionKey)}
                        style={{
                            width: 400,
                            height: 300
                        }}
                    />
                                </Fragment>
                        )
                        }}
                    </UserProfileConsumer>
                </div>
            </Spin>
        )
    }
}
