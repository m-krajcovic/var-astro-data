import React, {Component} from "react";
import ReactEcharts from "echarts-for-react";
import MinimaList from "./MinimaList"
import {Col, Radio, Row} from "antd";

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

const methodValue = function (method) {
    if (method === "pg") {
        return "photographic";
    } else if (method === "vis") {
        return "visual";
    } else {
        return "CCD / photoelectric";
    }
};

const cValue = function (d) {
    return d.kind + " - " + methodValue(d.color);
};

const jdToDate = (jd) => {
    const added = jd - 2451545.0;
    return new Date(946728000000 + added * 86400000)
};

const ocCalc = function (element, minima) {
    let e = Math.round((minima.julianDate - element.minimum0) / element.period);
    let oc = minima.julianDate - (element.minimum0 + element.period * e);
    return oc.toFixed(5);
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
        this.state = {customMinima: [], xAxisOptionKey: 'epoch'};
        this.echartsReact = null;
    }

    render() {
        if (this.props.minima) {
            const grouppedMinima = {
                "p - CCD / photoelectric": [],
                "p - visual": [],
                "p - photographic": [],
                's - CCD / photoelectric': [],
                "s - visual": [],
                "s - photographic": []
            };
            const minimaList = [];
            this.props.minima.forEach(minima => {
                minima.type = cValue(minima);
                let oc = minima.oc;
                let epoch = null;
                if (minima.kind === 'p' && this.props.primary && this.props.primary.minimum0 && this.props.primary.period) {
                    oc = ocCalc(this.props.primary, minima);
                    epoch = Math.round((minima.julianDate - this.props.primary.minimum0) / this.props.primary.period);
                }
                if (minima.kind === 's' && this.props.secondary && this.props.secondary.minimum0 && this.props.secondary.period) {
                    oc = ocCalc(this.props.secondary, minima);
                    epoch = Math.round((minima.julianDate - this.props.secondary.minimum0) / this.props.secondary.period);
                }
                if (minima.quality !== '?') {
                    if (grouppedMinima[minima.type] && oc && epoch) {
                        grouppedMinima[minima.type].push([epoch, oc, minima.julianDate, jdToDate(minima.julianDate)]);
                        minimaList.push({epoch, oc, minima});
                    }
                }
            });
            if (this.state.customMinima.length > 0) {
                grouppedMinima["user"] = this.state.customMinima.map(minima => {
                    let oc = null;
                    let epoch = null;
                    if (minima.kind === 'p' && this.props.primary && this.props.primary.minimum0 && this.props.primary.period) {
                        oc = ocCalc(this.props.primary, minima);
                        epoch = Math.round((minima.julianDate - this.props.primary.minimum0) / this.props.primary.period);
                    }
                    if (minima.kind === 's' && this.props.secondary && this.props.secondary.minimum0 && this.props.secondary.period) {
                        oc = ocCalc(this.props.secondary, minima);
                        epoch = Math.round((minima.julianDate - this.props.secondary.minimum0) / this.props.secondary.period);
                    }
                    return [epoch, oc, minima.julianDate, jdToDate(minima.julianDate)];
                }).filter(row => row[0] != null && row[1] != null);
            }
            minimaList.sort((a, b) => a.epoch - b.epoch);
            return (
                <>
                    <div className="panel"
                         style={{position: 'relative', overflow: 'auto', marginBottom: 12, maxWidth: 900}}>
                        <Row>
                            <Col span={24} style={{marginTop: 8, textAlign: "center"}}>
                                <label>X Axis: </label>
                        <Radio.Group onChange={(e) => this.setState({...this.state, xAxisOptionKey: e.target.value})}
                                     defaultValue="epoch">
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
                                option={this.getOption(grouppedMinima, this.state.xAxisOptionKey)}
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
                        <div className="panel-body"
                             style={{maxWidth: 600, margin: "auto", display: 'flex', flexWrap: 'wrap'}}>
                            {Object.keys(grouppedMinima).map((key, index) => {
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
                    </div>
                    <MinimaList onCustomMinimaChange={(customMinima) => this.handleCustomMinimaChange(customMinima)}
                                minimaList={minimaList}/>
                </>
            );
        }

        return (
            <div></div>
        )
    }

    handleCustomMinimaChange(customMinima) {
        this.setState({...this.state, customMinima});
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

    getOption(grouppedMinima, xAxisOptionKey) {
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
        return {
            title: {},
            tooltip: {
                formatter: (params) => {
                    return `
${params.marker}${params.seriesName}<br/>
<br/>
O-C: ${params.data[1]}<br/>
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
            dataset: [{
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
            }
            ],
            grid: [
                {
                    right: 60, bottom: 80, left: 50, top: 30,
                },
            ],
            xAxis: {
                type: xAxisOption.axisType,
                scale: true,
            },
            yAxis: {
                type: 'value',
                scale: true,
            },
            dataZoom: [
                {
                    type: 'inside',
                    filterMode: 'empty'
                },
                {
                    type: 'slider',
                    showDataShadow: false,
                    bottom: 15,
                    filterMode: 'empty'
                },
                {
                    type: 'inside',
                    orient: 'vertical',
                    filterMode: 'empty'
                },
                {
                    type: 'slider',
                    orient: 'vertical',
                    showDataShadow: false,
                    right: 15,
                    filterMode: 'empty'
                }
            ],
            animation: false,
            series: series
        };
    }
}
