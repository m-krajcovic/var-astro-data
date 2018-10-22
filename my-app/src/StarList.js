import React, {Component} from 'react';
import './StarList.css';
import ReactEcharts from "echarts-for-react";


class StarList extends Component {
    constructor(props) {
        super(props);
        this.state = {selectedStar: null};
    }

    render() {
        if (this.props.loading) {
            return (
                <span>Loading...</span>
            );
        }
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
            <li style={this.props.style} className={this.props.className}
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
    static methodValue(method) {
        if (method === "pg") {
            return "photographic";
        } else if (method === "vis") {
            return "visual";
        } else {
            return "CCD / photoelectric";
        }
    };

    cValue(d) {
        return d.kind + " - " + StarMinimaChart.methodValue(d.color);
    };

    static ocCalc(element, minima) {
        let e = Math.round((minima.julianDate - element.minimum0) / element.period);
        let oc = minima.julianDate - (element.minimum0 + element.period * e);
        return oc;
    };

    render() {
        if (this.props.minima) {

            this.props.minima.forEach(minima => {
                minima.type = this.cValue(minima);
                if (minima.kind === 'p' && this.props.primary) {
                    minima.oc = StarMinimaChart.ocCalc(this.props.primary, minima)
                }
                if (minima.kind === 's' && this.props.secondary) {
                    minima.oc = StarMinimaChart.ocCalc(this.props.secondary, minima)
                }
            });
            return (
                <div style={{height: 'calc(100% - 24px)', width: 'calc(100% - 12px)', marginTop: 12}}>
                    <div className="panel" style={{height: '100%', width: '100%'}}>
                        <ReactEcharts
                            option={this.getOption()}
                            style={{overflow: 'hidden', height: '100%', width: '100%'}}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div></div>
        )
    }

    getOption() {
        return {
            title: {},
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
            series: [{
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
    static printKind(kind) {
        return kind === 'p' ? 'Primary' : 'Secondary';
    }

    render() {
        if (this.props.loading) {
            return (
                <span>Loading...</span>
            );
        }
        if (this.props.star) {
            const star = this.props.star;
            let primaryElement, secondaryElement;
            star.elements.forEach(e => {
                if (e.kind === 'p') {
                    primaryElement = e;
                } else if (e.kind === 's') {
                    secondaryElement = e;
                }
            });
            return (
                <div className="star-detail-container" style={{
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "100%",
                    height: "100%",
                    paddingLeft: 12
                }}>
                    <h3 style={{flex: "0 0 auto"}}>{star.starName} {star.constellation}</h3>
                    <div style={{display: 'flex', flex: "0 0 auto", marginBottom: 12}}>
                        <div className="panel" style={{padding: 8}}>
                            <div><b>Coordinates</b></div>
                            <div>{this.coordinatesToString(star.coordinates)}</div>
                        </div>
                    </div>
                    <div className="star-detail-wrapper">
                        {star.elements.map(el => {
                            return (
                                <div className="star-detail panel" key={el.id}>
                                    <div><b>{StarDetail.printKind(el.kind)}</b></div>
                                    <div><b>M0: </b>{el.minimum0}</div>
                                    <div><b>M9: </b>{el.minimum9}</div>
                                    <div><b>Period: </b>{el.period}</div>
                                </div>
                            )
                        })}
                        {star.brightness.map(bright => {
                            return (
                                <div className="star-detail panel" key={bright.id}>
                                    <div><b>Brightness</b></div>
                                    <div><b>Max P: </b>{bright.maxP}</div>
                                    <div><b>Min P: </b>{bright.minP}</div>
                                    <div><b>Min S: </b>{bright.minS}</div>
                                </div>
                            )
                        })}
                    </div>
                    <div style={{flex: "1"}}>
                        <StarMinimaChart minima={star.minima} primary={primaryElement} secondary={secondaryElement}/>
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
