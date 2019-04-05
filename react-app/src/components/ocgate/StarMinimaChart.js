import React, {Component, Fragment} from "react";
import ReactEcharts from "echarts-for-react";
import {Col, Radio, Row} from "antd";
import {UserProfileConsumer} from "../common/UserProfileContext";

const red = "#ba160c";
const blue = "#0038a8";
const yellow = "#eacc5d";

const datasetIndexes = {
    "p - CCD / photoelectric": 0,
    "p - visual": 1,
    "p - photographic": 2,
    's - CCD / photoelectric': 3,
    "s - visual": 4,
    "s - photographic": 5,
    "user": 6
};

const colors = {
    "p - CCD / photoelectric": red,
    "p - visual": blue,
    "p - photographic": yellow,
    's - CCD / photoelectric': "#ffffff",
    "s - visual": "#ffffff",
    "s - photographic": "#ffffff",
    "user": "#000000"
};
const borderColors = {
    "p - CCD / photoelectric": red,
    "p - visual": blue,
    "p - photographic": yellow,
    's - CCD / photoelectric': red,
    "s - visual": blue,
    "s - photographic": yellow,
    "user": "#000000"
};


class ChartLegendItem extends Component {
    constructor(props) {
        super(props);
        this.state = {active: true};
    }

    render() {
        if (this.props.legend) {
            const key = this.props.legend;
            return (
                <span key={key} style={{flex: "1 0 33%", textAlign: "center", cursor: 'pointer'}}
                      className={`legendItem ${this.state.active ? 'selected' : 'deselected'}`}
                      onClick={() => {
                          if (this.props.onClick) {
                              this.props.onClick(key, !this.state.active);
                          }
                          this.setState({active: !this.state.active});
                      }}>
                    <span style={{
                        display: 'inline-block',
                        height: 8,
                        width: 8,
                        borderRadius: '100%',
                        borderWidth: 1,
                        borderColor: borderColors[key],
                        backgroundColor: colors[key],
                        borderStyle: 'solid',
                        marginRight: 4
                    }}/>
                    {key}
            </span>
            )
        }
        return <span></span>
    }
}

export default class StarMinimaChart extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.echartsReact = null;
    }

    render() {
        if (this.props.grouppedMinima) {
            return (
                <Fragment>
                    <UserProfileConsumer>
                        {({config, updateConfig}) => {
                            return (
                                <Fragment>
                                    <Row>
                                        <Col span={24} style={{marginTop: 8, textAlign: "center"}}>
                                            <label>X Axis: </label>
                                            <Radio.Group
                                                onChange={(e) => {
                                                    updateConfig({...config, xAxisOptionKey: e.target.value});
                                                }}
                                                defaultValue={config.xAxisOptionKey}>
                                                <Radio.Button value="epoch">Epoch</Radio.Button>
                                                <Radio.Button value="jd">JD</Radio.Button>
                                                <Radio.Button value="date">Date</Radio.Button>
                                            </Radio.Group>
                                        </Col>
                                    </Row>
                                    <div style={{position: 'relative', paddingTop: '75%', width: '100%'}}>
                                        <ReactEcharts
                                            ref={(e) => {
                                                this.echartsReact = e;
                                            }}
                                            option={this.getOption(this.props.grouppedMinima, this.props.approximation, config.xAxisOptionKey)}
                                            style={{
                                                overflow: 'hidden',
                                                position: "absolute",
                                                top: 0,
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                height: '100%'
                                            }}
                                        />
                                    </div>
                                </Fragment>
                            );
                        }}
                    </UserProfileConsumer>
                    <div className="panel-body"
                         style={{maxWidth: 600, margin: "auto", display: 'flex', flexWrap: 'wrap'}}>
                        {Object.keys(this.props.grouppedMinima)
                            .filter(key => this.props.grouppedMinima[key].length)
                            .map((key, index) => {
                                return (
                                    <ChartLegendItem key={key} legend={key} onClick={(legend, active) => {
                                        const echartsInstance = this.echartsReact.getEchartsInstance();
                                        echartsInstance.dispatchAction({
                                            type: 'legendToggleSelect',
                                            name: legend
                                        });
                                    }}/>
                                )
                            })}
                    </div>
                </Fragment>
            )
                ;
        }

        return (
            <div></div>
        )
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

    getOption(grouppedMinima, approximation, xAxisOptionKey) {
        xAxisOptionKey = xAxisOptionKey || 'epoch';
        const xAxisOption = StarMinimaChart.xAxisOptions[xAxisOptionKey];
        const series = Object.keys(grouppedMinima).map(key => {
            return {
                name: key,
                type: 'scatter',
                symbolSize: 5,
                itemStyle: {
                    opacity: 0.8,
                    color: colors[key],
                    borderWidth: 1,
                    borderColor: borderColors[key]
                },
                datasetIndex: datasetIndexes[key],
                encode: {
                    x: xAxisOption.xIndex,
                    y: 1,
                    tooltip: [1, 0, 2, 3]
                }
            };
        });

        series.push({
            name: 'approximation',
            type: 'line',
            data: approximation || [],
            showSymbol: false,
            smooth: true,
            lineStyle: {
                color: 'black'
            },
            xAxisIndex: 1,
        });

        const datasets = [{
            dimensions: ['epoch', 'oc', 'julianDate', 'date'],
            source: grouppedMinima["p - CCD / photoelectric"]
        }, {
            dimensions: ['epoch', 'oc', 'julianDate', 'date'],
            source: grouppedMinima["p - visual"]
        }, {
            dimensions: ['epoch', 'oc', 'julianDate', 'date'],
            source: grouppedMinima["p - photographic"]
        }, {
            dimensions: ['epoch', 'oc', 'julianDate', 'date'],
            source: grouppedMinima['s - CCD / photoelectric']
        }, {
            dimensions: ['epoch', 'oc', 'julianDate', 'date'],
            source: grouppedMinima["s - visual"]
        }, {
            dimensions: ['epoch', 'oc', 'julianDate', 'date'],
            source: grouppedMinima["s - photographic"]
        }, {
            dimensions: ['epoch', 'oc', 'julianDate', 'date'],
            source: grouppedMinima['user']
        }];

        let options = {
            title: {},
            tooltip: {
                formatter: (params) => {
                    return `
${params.marker}${params.seriesName}<br/>
<br/>
O-C: ${params.data[1].toFixed(5)}<br/>
Epoch: ${params.data[0]}<br/>
JD: ${params.data[2]}<br/>
Date: ${params.data[3].toISOString()}`;
                }

            },
            legend: {
                show: false,
                orient: 'horizontal',
                bottom: 10,
            },
            dataset: datasets,
            grid: [
                {
                    right: 60, bottom: 80, left: 50, top: 30,
                },
            ],
            xAxis: [{
                type: xAxisOption.axisType,
                scale: true,
                min: 'dataMin',
                max: 'dataMax',
            }, {
                type: 'value',
                min: 'dataMin',
                max: 'dataMax',
                scale: true,
                show: false,
            }],
            yAxis: {
                type: 'value',
                scale: true,
            },
            dataZoom: [
                {
                    type: 'inside',
                    filterMode: 'empty',
                    xAxisIndex: [0, 1]
                },
                {
                    type: 'slider',
                    showDataShadow: false,
                    bottom: 15,
                    filterMode: 'empty',
                    xAxisIndex: [0, 1]
                },
                {
                    type: 'inside',
                    orient: 'vertical',
                    filterMode: 'empty',
                },
                {
                    type: 'slider',
                    orient: 'vertical',
                    showDataShadow: false,
                    right: 15,
                    filterMode: 'empty',
                }
            ],
            animation: false,
            series: series
        };
        return options;
    }
}