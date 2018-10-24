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
        return oc.toFixed(5);
    };

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
            this.props.minima.forEach(minima => {
                minima.type = this.cValue(minima);
                if (minima.kind === 'p' && this.props.primary) {
                    minima.oc = StarMinimaChart.ocCalc(this.props.primary, minima)
                }
                if (minima.kind === 's' && this.props.secondary) {
                    minima.oc = StarMinimaChart.ocCalc(this.props.secondary, minima)
                }
                if (minima.quality !== '?') {
                    grouppedMinima[minima.type].push(minima);
                }
            });
            return (
                <div style={{flex: '1 1 auto', paddingTop: 12, paddingBottom: 12, paddingRight: 12, overflow: 'hidden'}}>
                    <div className="panel" style={{height: '100%', width: '100%', position: 'relative', overflow: 'hidden'}}>
                        <ReactEcharts
                            option={this.getOption(grouppedMinima)}
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

    getOption(grouppedMinima) {
        const datasetIndexes = {
            "p - CCD / photoelectric": 0,
            "p - visual": 1,
            "p - photographic": 2,
            's - CCD / photoelectric': 3,
            "s - visual": 4,
            "s - photographic": 5
        };
        const colors = {
            "p - CCD / photoelectric": "#ba160c",
            "p - visual": "#0038a8",
            "p - photographic": "#eacc5d",
            's - CCD / photoelectric': "#ffffff",
            "s - visual": "#ffffff",
            "s - photographic": "#ffffff"
        };
        const borderWidths = {
            "p - CCD / photoelectric": 0,
            "p - visual": 0,
            "p - photographic": 0,
            's - CCD / photoelectric': 1,
            "s - visual": 1,
            "s - photographic": 1
        };
        const borderColors = {
            "p - CCD / photoelectric": "#000000",
            "p - visual": "#000000",
            "p - photographic": "#000000",
            's - CCD / photoelectric': "#ba160c",
            "s - visual": "#0038a8",
            "s - photographic": "#eacc5d"
        };
        const series = Object.keys(grouppedMinima).map(key => {
            return {
                name: key,
                type: 'scatter',
                symbolSize: 8,
                itemStyle: {
                    opacity: 0.8,
                    color: colors[key],
                    borderWidth: borderWidths[key],
                    borderColor: borderColors[key]
                },
                datasetIndex: datasetIndexes[key],
                encode: {
                    x: 0,
                    y: 1,
                    tooltip: [0, 1, 2]
                }
            };
        });
        return {
            title: {},
            tooltip: {},
            legend: {
                orient: 'horizontal',
                bottom: 10,
            },
            dataset: [{
                dimensions: ['julianDate', 'oc', 'type'],
                source: grouppedMinima["p - CCD / photoelectric"]
            },{
                dimensions: ['julianDate', 'oc', 'type'],
                source: grouppedMinima["p - visual"]
            },{
                dimensions: ['julianDate', 'oc', 'type'],
                source: grouppedMinima["p - photographic"]
            },{
                dimensions: ['julianDate', 'oc', 'type'],
                source: grouppedMinima['s - CCD / photoelectric']
            },{
                dimensions: ['julianDate', 'oc', 'type'],
                source: grouppedMinima["s - visual"]
            },{
                dimensions: ['julianDate', 'oc', 'type'],
                source: grouppedMinima["s - photographic"]
            },],
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
            // visualMap: {
            //     type: 'piecewise',
            //     categories: ['p - CCD / photoelectric', 'p - visual', 'p - photographic', 's - CCD / photoelectric', 's - visual', 's - photographic'],
            //     inRange: {
            //         color: {
            //             "p - CCD / photoelectric": "#ba160c",
            //             "p - visual": "#0038a8",
            //             "p - photographic": "#eacc5d",
            //             's - CCD / photoelectric': "#ffffff",
            //             "s - visual": "#ffffff",
            //             "s - photographic": "#ffffff"
            //         },
            //         symbolSize: [5, 7, 10, 5, 7, 10],
            //         // symbol: ['circle', 'circle', 'circle', 'path://M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0','path://M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0', 'path://M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0'],
            //         borderWidth: 1,
            //         borderColor: 'black'
            //     },
            //     bottom: 10,
            //     orient: 'horizontal',
            //     left: 'center'
            // },
            animation: false,
            series: series
        };
    }
}

export class StarDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {selectedPrimaryElement: null, selectedSecondaryElement: null};
    }

    componentDidMount() {
        if (this.props.star) {
            let primaryElement, secondaryElement;
            this.props.star.elements.forEach(e => {
                if (e.kind === 'p') {
                    primaryElement = e;
                } else if (e.kind === 's') {
                    secondaryElement = e;
                }
            });
            if (!primaryElement && secondaryElement) primaryElement = secondaryElement;
            if (primaryElement && !secondaryElement) secondaryElement = primaryElement;
            this.setState({...this.state, selectedPrimaryElement: primaryElement, selectedSecondaryElement: secondaryElement});
        }
    }

    static printKind(kind) {
        if (kind === 'p') {
            return 'Primary';
        } else if (kind === 's') {
            return 'Secondary';
        }
        return kind;
    }

    render() {
        if (this.props.loading) {
            return (
                <span>Loading...</span>
            );
        }
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
                    <div style={{display: 'flex', flex: "0 0 auto", marginBottom: 12}}>
                        <div className="panel star-detail">
                            <div><b>Coordinates</b></div>
                            <div>{this.coordinatesToString(star.coordinates)}</div>
                        </div>
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
                    <div className="star-detail-wrapper">
                        {star.elements.filter(el => el.kind === 'p' || el.kind === 's').sort((a,b) => a.kind === 'p' ? -1 : 1).map(el => {
                            return (
                                <div className="star-detail panel" key={el.id}>
                                    <div><b>{StarDetail.printKind(el.kind)}</b></div>
                                    <div><b>M0: </b>{el.minimum0}</div>
                                    <div><b>Period: </b>{el.period}</div>
                                </div>
                            )
                        })}
                    </div>
                    <div style={{flex: "1 1 auto", display: "flex"}}>
                        <StarMinimaChart minima={star.minima} primary={this.state.selectedPrimaryElement} secondary={this.state.selectedSecondaryElement}/>
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
