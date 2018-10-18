import React, {Component} from 'react';
import './StarList.css';
import ReactEcharts from "echarts-for-react";


class StarList extends Component {
    constructor(props) {
        super(props);
        this.state = {selectedStar: null};
    }

    render() {
        if (this.props.stars) {
            return (
                <ul>
                    {this.props.stars.map(star => {
                        return (
                            <StarListItem key={star.starName}
                                          className={this.state.selectedStar === star ? "selected" : ""} star={star}
                                          onClick={(name) => this.onSelected(name)}/>
                        )
                    })}
                </ul>
            )
        } else {
            return (
                <ul>
                    <li>Loading stars</li>
                </ul>
            )
        }
    }

    onSelected(star) {
        if (this.props.onSelected) {
            this.props.onSelected(star);
        }
        this.setState({selectedStar: star});
    }
}

class StarListItem extends Component {
    render() {
        return (
            <li style={[this.props.style]} className={this.props.className}
                onClick={() => this.onClick()}>{this.props.star.starName} ({this.props.star.minimaCount})</li>
        )
    }

    onClick() {
        if (this.props.onClick) {
            this.props.onClick(this.props.star);
        }
    }
}

class StarMinimaChart extends Component {

    render() {
        if (this.props.minima) {
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
            const groupCache = {};
            let xMin = Number.MAX_SAFE_INTEGER, xMax = Number.MIN_SAFE_INTEGER, yMin = Number.MAX_SAFE_INTEGER,
                yMax = Number.MIN_SAFE_INTEGER;
            this.props.minima.forEach(minima => {
                const cat = cValue(minima);
                minima.type = cat;
            });
            const colors = {
                "p - CCD / photoelectric": "#ba160c",
                "p - visual": "#0038a8",
                "s - CCD / photoelectric": "#d60270",
                "p - photographic": "#eacc5d",
                "s - visual": "#9494ff",
                "s - photographic": "#00a8ff"
            };
            const margin = {
                top: 20,
                right: 20,
                bottom: 50,
                left: 60
            };

            return (
                <ReactEcharts
                    option={this.getOption()}
                    style={{overflow: 'hidden', height: '100%', width: '100%'}}
                />
            );
        }

        return (
            <div></div>
        )
    }

    getOption() {
        return {
            title: {
            },
            tooltip: {},
            legend: {
                orient: 'horizontal',
                bottom: 10,
            },
            dataset: {
                dimensions: ['julianDate', 'oc', 'type'],
                source: this.props.minima
            },
            grid: [
                {
                    right: 60, bottom: 110, left: 50, top: 30,
                },
            ],
            xAxis: {
                type: 'value',
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
                    bottom: 50,
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
                    right: 20,
                    filterMode: 'empty'
                }
            ],
            visualMap: {
                type: 'piecewise',
                categories: ['p - CCD / photoelectric', 'p - visual', 'p - photographic', 's - CCD / photoelectric', 's - visual', 's - photographic'],
                inRange: {
                    color: {
                        "p - CCD / photoelectric": "#ba160c",
                        "p - visual": "#0038a8",
                        "p - photographic": "#eacc5d",
                        's - CCD / photoelectric': "#d60270",
                        "s - visual": "#9494ff",
                        "s - photographic": "#00a8ff"
                    },
                    symbolSize: [5, 7, 10, 5, 7, 10],
                    // symbol: ['circle', 'rect', 'diamond', 'circle', 'rect', 'diamond']
                },
                bottom: 10,
                orient: 'horizontal',
                left: 'center'
            },
            animation: false,
            series : [{
                type: 'scatter',
                symbolSize: 5,
                itemStyle: {
                    opacity: 0.8
                },
                encode: {
                    x: 0,
                    y: 1,
                    tooltip: [0, 1, 2]
                }
            }]
        };
    }
}

export class StarDetail extends Component {
    render() {
        if (this.props.star) {
            const star = this.props.star;
            return (
                <div className="star-detail-container" style={{
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "100%",
                    height: "100%",
                    paddingLeft: 12
                }}>
                    <h3 style={{flex: "0 0 auto"}}>{star.starName} {star.constellation}</h3>
                    <div style={{flex: "0 0 auto"}}><b>Coordinates: </b>{this.coordinatesToString(star.coordinates)}
                    </div>
                    <div className="star-detail-wrapper">
                        {star.elements.map(el => {
                            return (
                                <div className="star-detail" key={el.id}>
                                    <div><b>Element {el.kind}</b></div>
                                    <div><b>Minimum 0: </b>24{el.minimum0}</div>
                                    <div><b>Minimum 9: </b>24{el.minimum9}</div>
                                    <div><b>Period: </b>{el.period}</div>
                                </div>
                            )
                        })}
                        {star.brightness.map(bright => {
                            return (
                                <div className="star-detail" key={bright.id}>
                                    <div><b>Brightness</b></div>
                                    <div><b>Max P: </b>24{bright.maxP}</div>
                                    <div><b>Min P: </b>24{bright.minP}</div>
                                    <div><b>Min S: </b>{bright.minS}</div>
                                </div>
                            )
                        })}
                    </div>
                    <div style={{flex: "1"}}>
                        <StarMinimaChart minima={star.minima}/>
                    </div>
                </div>
            );
        }
        return (
            <div></div>
        )
    }

    coordinatesToString(coords) {
        return `${coords.raHours}:${coords.raMinutes}:${coords.raSeconds} ${coords.decSign}${coords.decDegrees}:${coords.decMinutes}:${coords.decSeconds}`;
    }
}

export default StarList;
