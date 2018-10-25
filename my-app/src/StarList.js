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
const borderColors = {
    "p - CCD / photoelectric": "#ba160c",
    "p - visual": "#0038a8",
    "p - photographic": "#eacc5d",
    's - CCD / photoelectric': "#ba160c",
    "s - visual": "#0038a8",
    "s - photographic": "#eacc5d"
};

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
            const minimaList = [];
            this.props.minima.forEach(minima => {
                minima.type = this.cValue(minima);
                let oc = minima.oc;
                let epoch = null;
                if (minima.kind === 'p' && this.props.primary) {
                    oc = StarMinimaChart.ocCalc(this.props.primary, minima);
                    epoch = Math.round((minima.julianDate - this.props.primary.minimum0) / this.props.primary.period);
                }
                if (minima.kind === 's' && this.props.secondary) {
                    oc = StarMinimaChart.ocCalc(this.props.secondary, minima);
                    epoch = Math.round((minima.julianDate - this.props.secondary.minimum0) / this.props.secondary.period);
                }
                if (minima.quality !== '?') {
                    if (grouppedMinima[minima.type]) {
                        grouppedMinima[minima.type].push([epoch, oc, minima.julianDate]);
                        minimaList.push({epoch, oc, minima});
                    }
                }
            });
            minimaList.sort((a,b) => a.epoch - b.epoch);
            return (
                <>
                    <div className="panel" style={{position: 'relative', overflow: 'hidden', marginRight: 12}}>
                        <ReactEcharts
                            option={this.getOption(grouppedMinima)}
                            style={{overflow: 'hidden', height: 500, width: 700}}
                        />
                        <div className="panel-body" style={{width: 600, margin: "auto", display: 'flex', flexWrap: 'wrap'}}>
                            {Object.keys(grouppedMinima).map(key => {
                                return (
                                    <span key={key} style={{flex: "0 0 33%", textAlign: "center"}}>
                                        <span style={{display: 'inline-block', height: 8, width: 8, borderRadius: '100%', borderWidth: 1, borderColor: borderColors[key], backgroundColor: colors[key], borderStyle: 'solid', marginRight: 4}}></span>
                                        {key}
                                    </span>
                                )
                            })}
                        </div>
                    </div>
                    <div className="panel" style={{maxHeight: 500, overflow: "auto"}}>
                        <div className="panel-body">
                            <ul style={{paddingLeft: 0}}>
                                <li><b>Epoch &nbsp; O-C</b></li>
                                {
                                    minimaList.map(minima => {
                                        return (
                                            <li key={minima.minima.id}>{minima.epoch} &nbsp; {minima.oc}</li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </>
            );
        }

        return (
            <div></div>
        )
    }

    getOption(grouppedMinima) {
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
                show: false,
                orient: 'horizontal',
                bottom: 10,
            },
            dataset: [{
                dimensions: ['epoch', 'oc', 'julianDate'],
                source: grouppedMinima["p - CCD / photoelectric"]
            }, {
                dimensions: ['epoch', 'oc', 'julianDate'],
                source: grouppedMinima["p - visual"]
            }, {
                dimensions: ['epoch', 'oc', 'julianDate'],
                source: grouppedMinima["p - photographic"]
            }, {
                dimensions: ['epoch', 'oc', 'julianDate'],
                source: grouppedMinima['s - CCD / photoelectric']
            }, {
                dimensions: ['epoch', 'oc', 'julianDate'],
                source: grouppedMinima["s - visual"]
            }, {
                dimensions: ['epoch', 'oc', 'julianDate'],
                source: grouppedMinima["s - photographic"]
            },],
            grid: [
                {
                    right: 60, bottom: 80, left: 50, top: 30,
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
                    bottom: 20,
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
            animation: false,
            series: series
        };
    }
}

export class StarDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {selectedElement: 'server', customPrimaryElement: {}, customSecondaryElement: {}};
        this.customElement = {primary: {}, secondary: {}};
    }

    getDefaultElements() {
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
            return {primary: primaryElement, secondary: secondaryElement};
        }
        return null;
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
            let primaryElement = this.state.customPrimaryElement;
            let secondaryElement = this.state.customSecondaryElement;
            const customValuesError = (this.state.selectedElement === 'custom') && !((primaryElement.minimum0 && primaryElement.period) || (secondaryElement.minimum0 && secondaryElement.period));
            if (this.state.selectedElement === 'server' || customValuesError) {
                const elements = this.getDefaultElements();
                primaryElement = elements.primary;
                secondaryElement = elements.secondary;
            }
            return (
                <div className="star-detail-container" style={{
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: 12
                }}>
                    <h3 style={{flex: "0 0 auto"}}>{star.starName} {star.constellation}</h3>
                    <div style={{display: 'flex', flex: "0 0 auto", marginBottom: 12}}>
                        <div className="panel star-detail">
                            <div className="panel-header"><b>Coordinates</b></div>
                            <div className="panel-body">
                                <div>{this.coordinatesToString(star.coordinates)}</div>
                            </div>
                        </div>
                        {star.brightness.map(bright => {
                            return (
                                <div className="star-detail panel" key={bright.id}>
                                    <div className="panel-header">
                                        <b>Brightness</b>
                                    </div>
                                    <div className="panel-body">
                                        <div><b>Max P: </b>{bright.maxP}</div>
                                        <div><b>Min P: </b>{bright.minP}</div>
                                        <div><b>Min S: </b>{bright.minS}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="star-detail-wrapper">
                        <div className={`star-detail panel`}>
                            <div className={`panel-header selectable ${this.state.selectedElement === 'server' ? ' selected' : ''}`}
                                 onClick={() => {
                                     this.setState({...this.state, selectedElement: 'server'});
                                 }}>
                                <b>From Server</b>
                            </div>
                            <div className="panel-body" style={{display: 'flex', flexDirection: 'row'}}>
                                {star.elements.filter(el => el.kind === 'p' || el.kind === 's').sort((a, b) => a.kind === 'p' ? -1 : 1).map(el => {
                                    return (
                                        <div key={el.id} style={{marginRight: 12}}>
                                            <div>{StarDetail.printKind(el.kind)}</div>
                                            <div className="space-out"><b>M0: </b>{el.minimum0}</div>
                                            <div className="space-out"><b>Period: </b>{el.period}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className={`star-detail panel`}
                        >
                            <div className={`panel-header selectable ${this.state.selectedElement === 'custom' ? ' selected' : ''}`}
                                 onClick={() => {
                                     this.setState({...this.state, selectedElement: 'custom'});
                                 }}>
                                <b>Custom</b>
                            </div>
                            <div className="panel-body" style={{display: 'flex', flexDirection: 'row'}}>
                                <div style={{marginRight: 12}}>
                                    <div>Primary</div>
                                    <div className="space-out"><b>M0: </b><input type="text"
                                                                                 onInput={(e) => this.handleCustomInputChange('primary', 'minimum0', e)}/>
                                    </div>
                                    <div className="space-out"><b>Period: </b><input type="text"
                                                                                     onInput={(e) => this.handleCustomInputChange('primary', 'period', e)}/>
                                    </div>
                                </div>
                                <div style={{marginRight: 12}}>
                                    <div>Secondary</div>
                                    <div className="space-out"><b>M0: </b><input type="text"
                                                                                 onInput={(e) => this.handleCustomInputChange('secondary', 'minimum0', e)}/>
                                    </div>
                                    <div className="space-out"><b>Period: </b><input type="text"
                                                                                     onInput={(e) => this.handleCustomInputChange('secondary', 'period', e)}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        {customValuesError ? 'Invalid custom values, using the server ones.' : ''}
                    </div>
                    <div style={{flexWrap: "wrap", flex: "1 1 auto", display: "flex", marginTop: 12}}>
                        <StarMinimaChart minima={star.minima} primary={primaryElement} secondary={secondaryElement}/>
                    </div>
                </div>
            );
        }
        return (
            <div></div>
        )
    }

    handleCustomInputChange(kind, key, event) {
        this.customElement[kind][key] = +event.target.value;
        this.setState({
            ...this.state,
            customPrimaryElement: this.customElement.primary,
            customSecondaryElement: this.customElement.secondary
        });
    }

    coordinatesToString(coords) {
        return `${coords.raHours}:${coords.raMinutes}:${coords.raSeconds} ${coords.decSign}${coords.decDegrees}:${coords.decMinutes}:${coords.decSeconds}`;
    }
}

export default StarList;
