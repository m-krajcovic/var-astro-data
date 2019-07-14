import React, {Component} from 'react';
import StarMinimaChart from "./StarMinimaChart";
import regression from "regression";
import MinimaList from "./MinimaList";
import {Button, Col, InputNumber, Row, Select, Spin} from "antd";
import {CoordinateWrapper} from "../common/CoordinateWrapper";

const prependZero = function (length, number) {
    let numberStr = `${number}`;
    for (let i = 0; i < length - number; i++) {
        numberStr = "0" + numberStr;
    }
    return numberStr;
};

// const coordinatesToString = function(coords) {
//     return `${prependZero(2, coords.raHours)} ${prependZero(2, coords.raMinutes)} ${prependZero(2, coords.raSeconds)} ${coords.decSign}${prependZero(2, coords.decDegrees)} ${prependZero(2, coords.decMinutes)} ${prependZero(2, coords.decSeconds)}`;
// };

export const coordinatesToStringRa = function (coords) {
    return `${prependZero(2, coords.raHours)} ${prependZero(2, coords.raMinutes)} ${prependZero(2, coords.raSeconds)}`;
};

export const coordinatesToStringDec = function (coords) {
    return `${coords.decSign}${prependZero(2, coords.decDegrees)} ${prependZero(2, coords.decMinutes)} ${prependZero(2, coords.decSeconds)}`;
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

const cValue = function (element, minima) {
    return element.kind.name + " - " + minima.method.name;
};

export const jdToDate = (jd) => {
    const added = jd - 2451545.0;
    return new Date(946728000000 + added * 86400000)
};

const ocCalc = function (element, minima) {
    let e = Math.round((minima.julianDate - element.minimum) / element.period);
    return {epoch: e, oc: minima.julianDate - (element.minimum + element.period * e)};
};

const regressions = {
    // 'Linear': regression.linear,
    'Polynomial': regression.polynomial,
    // 'Exponential': regression.exponential,
    'Logarithmic': regression.logarithmic
};

class RegressionPicker extends Component {
    constructor(props) {
        super(props);
        this.state = {regression: 'Polynomial', order: 2, submitted: false};
    }


    handleMethodChange = (value) => {
        this.setState({...this.state, regression: value, submitted: false});
    };

    handleOrderChange = (value) => {
        this.setState({...this.state, order: value, submitted: false});
    };

    handleSubmit = () => {
        if (this.props.onSubmit) {
            this.props.onSubmit((data) => {
                return regressions[this.state.regression](data, {
                    precision: 50, order: this.state.order
                });
            });
            this.setState({...this.state, submitted: true});
        }
    };

    handleClear = () => {
        this.props.onSubmit(null);
        this.setState({...this.state, submitted: false});
    };

    render() {
        return (
            <Row>
                <Col style={{paddingLeft: 12, textAlign: "center"}}>
                    <span style={{marginRight: 8}}>
                    <label>Fitting method: </label>
                    <Select value={this.state.regression} style={{width: 120}}
                            onChange={this.handleMethodChange}>
                        {Object.keys(regressions).map(reg => (
                            <Select.Option key={reg} value={reg}>{reg}</Select.Option>
                        ))}
                    </Select>

                    </span>
                    {this.state.regression === 'Polynomial' && (
                        <span style={{marginRight: 8}}>
                    <label>Order: </label>
                    <InputNumber value={this.state.order} min={1} max={10}
                                 onChange={this.handleOrderChange}/>
                    </span>
                    )}
                    <Button style={{marginRight: 8}} disabled={this.state.submitted} type="primary" htmlType="button"
                            onClick={this.handleSubmit}>Fit</Button>
                    <Button disabled={!this.state.submitted} type="default" htmlType="button"
                            onClick={this.handleClear}>Clear</Button>
                </Col>
            </Row>
        )
    }
}

export default class StarDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {customPrimaryElement: {}, customSecondaryElement: {}, customMinima: [], regressionFunc: null};
        this.customElement = {primary: {}, secondary: {}};
    }

    getDefaultElements() {
        if (this.props.star) {
            let primaryElement, secondaryElement;
            this.props.star.elements.forEach(e => {
                if (e.kind.name === 'P') {
                    primaryElement = e;
                } else if (e.kind.name === 'S') {
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
        if (kind === 'P') {
            return 'Primary';
        } else if (kind === 'S') {
            return 'Secondary';
        }
        return kind;
    }

    handleCustomMinimaChange(customMinima) {
        this.setState({...this.state, customMinima});
    }

    render() {
        if (this.props.star) {
            const star = this.props.star;
            let primaryElement = this.state.customPrimaryElement;
            let secondaryElement = this.state.customSecondaryElement;
            const customValuesError = (this.props.selectedElement === 'custom') && !((primaryElement.minimum && primaryElement.period) || (secondaryElement.minimum && secondaryElement.period));
            if (this.props.selectedElement === 'server' || customValuesError) {
                const elements = this.getDefaultElements();
                primaryElement = elements.primary;
                secondaryElement = elements.secondary;
            }

            const grouppedMinima = {
                "P - CCD/Photoelectric": [],
                "P - Visual": [],
                "P - Photographic": [],
                'S - CCD/Photoelectric': [],
                "S - Visual": [],
                "S - Photographic": [],
                "user": []
            };
            const minimaList = [];
            star.elements.forEach(element => {
                element.minimas.forEach(minima => {
                    minima.element = element;
                    minima.type = cValue(element, minima);
                    let oc = 0;
                    let epoch = null;
                    let calculated = null;
                    if (element.kind.name === 'P' && primaryElement && primaryElement.minimum && primaryElement.period) {
                        calculated = ocCalc(primaryElement, minima);
                    }
                    if (element.kind.name === 'S' && secondaryElement && secondaryElement.minimum && secondaryElement.period) {
                        calculated = ocCalc(secondaryElement, minima);
                    }
                    if (calculated) {
                        oc = calculated.oc;
                        epoch = calculated.epoch;
                        minima.oc = calculated.oc;
                        minima.epoch = calculated.epoch;
                    }
                    // todo: quality?
                    // if (minima.quality !== '?') {
                        if (grouppedMinima[minima.type] && oc != null && epoch != null) {
                            const date = jdToDate(minima.julianDate);
                            minima.date = date;
                            grouppedMinima[minima.type].push([epoch, oc, minima.julianDate, date]);
                            minimaList.push(minima);
                        }
                    // }
                });
            });
            if (this.state.customMinima.length > 0) {
                grouppedMinima["user"] = this.state.customMinima.map(minima => {
                    let calculated = null;
                    if (minima.kind === 'P' && primaryElement && primaryElement.minimum && primaryElement.period) {
                        calculated = ocCalc(primaryElement, minima);
                    }
                    if (minima.kind === 'S' && secondaryElement && secondaryElement.minimum && secondaryElement.period) {
                        calculated = ocCalc(secondaryElement, minima);
                    }
                    return [calculated.epoch, calculated.oc, minima.julianDate, jdToDate(minima.julianDate)];
                }).filter(row => row[0] != null && row[1] != null);
            }
            minimaList.sort((a, b) => a.julianDate - b.julianDate);

            let approximation = null;
            if (this.state.regressionFunc) {
                approximation = [];
                const minJd = minimaList[0].jd;
                const maxJd = minimaList[minimaList.length - 1].jd;
                const jdApproximation = this.state.regressionFunc(minimaList.map(m => [m.jd - minJd + 1, m.oc]));
                const steps = 200;
                const stepJd = (maxJd - minJd) / steps;
                for (let i = 0; i <= steps; i++) {
                    const predict = jdApproximation.predict(i * stepJd + 1);
                    predict[0] = predict[0] + minJd - 1;
                    // predict[1] = predict[1];
                    approximation.push(predict);
                }
            }

            return (
                <div className="star-detail-container" style={{
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: 12,
                    paddingBottom: 12,
                    paddingRight: 12,
                }}>
                    <Spin spinning={this.props.loading}>
                        <h3 style={{flex: "0 0 auto"}}>{star.name} {star.constellation.abbreviation}</h3>
                        <div style={{display: 'flex', flex: "0 0 auto", marginBottom: 12}}>
                            <div className="panel star-detail">
                                <div className="panel-header"><b>Coordinates</b></div>
                                <div className="panel-body">
                                    <div><b>RA: </b><CoordinateWrapper value={star.coordinates.raString}/>
                                    </div>
                                    <div><b>DEC: </b><CoordinateWrapper
                                        value={star.coordinates.decString}/></div>
                                </div>
                            </div>
                            {star.brightness.map(bright => {
                                return (
                                    <div className="star-detail panel" key={bright.id}>
                                        <div className="panel-header">
                                            <b>Brightness ({bright.filter.name})</b>
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
                                <div
                                    className={`panel-header selectable ${this.props.selectedElement === 'server' ? ' selected' : ''}`}
                                    onClick={() => {
                                        if (this.props.onElementChange) {
                                            this.props.onElementChange('server');
                                        }
                                    }}>
                                    <b>From Server</b>
                                </div>
                                <div className="panel-body" style={{display: 'flex', flexDirection: 'row'}}>
                                    {star.elements.filter(el => el.kind.name === 'P' || el.kind.name === 'S').sort((a, b) => a.kind.name === 'P' ? -1 : 1).map(el => {
                                        return (
                                            <div key={el.id} style={{marginRight: 12}}>
                                                <div>{StarDetail.printKind(el.kind.name)}</div>
                                                <div className="space-out"><b>M0: </b>{el.minimum}</div>
                                                <div className="space-out"><b>Period: </b>{el.period}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className={`star-detail panel`}
                            >
                                <div
                                    className={`panel-header selectable ${this.props.selectedElement === 'custom' ? ' selected' : ''}`}
                                    onClick={() => {
                                        if (this.props.onElementChange) {
                                            this.props.onElementChange('custom');
                                        }
                                    }}>
                                    <b>Custom</b>
                                </div>
                                <div className="panel-body" style={{display: 'flex', flexDirection: 'row'}}>
                                    <div style={{marginRight: 12}}>
                                        <div>Primary</div>
                                        <div className="space-out"><b>M0: </b><input type="text"
                                                                                     value={this.state.customPrimaryElement.minimum}
                                                                                     onInput={(e) => this.handleCustomInputChange('primary', 'minimum', e)}/>
                                        </div>
                                        <div className="space-out"><b>Period: </b><input type="text"
                                                                                         value={this.state.customPrimaryElement.period}
                                                                                         onInput={(e) => this.handleCustomInputChange('primary', 'period', e)}/>
                                        </div>
                                    </div>
                                    <div style={{marginRight: 12}}>
                                        <div>Secondary</div>
                                        <div className="space-out"><b>M0: </b><input type="text"
                                                                                     value={this.state.customSecondaryElement.minimum}
                                                                                     onInput={(e) => this.handleCustomInputChange('secondary', 'minimum', e)}/>
                                        </div>
                                        <div className="space-out"><b>Period: </b><input type="text"
                                                                                         value={this.state.customSecondaryElement.period}
                                                                                         onInput={(e) => this.handleCustomInputChange('secondary', 'period', e)}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-error">
                            {customValuesError ? 'Invalid custom values, using the server ones.' : ''}
                        </div>
                        <div style={{marginTop: 12}}>

                            <div className="panel"
                                 style={{
                                     position: 'relative',
                                     overflow: 'auto',
                                     marginBottom: 12,
                                     paddingTop: 8,
                                     maxWidth: 900
                                 }}>
                                <RegressionPicker
                                    onSubmit={func => this.setState({...this.state, regressionFunc: func})}/>
                                <StarMinimaChart grouppedMinima={grouppedMinima} approximation={approximation}/>
                            </div>
                            <MinimaList
                                onCustomMinimaChange={(customMinima) => this.handleCustomMinimaChange(customMinima)}
                                minimaList={minimaList}/>
                        </div>
                    </Spin>
                </div>
            );
        }
        return (
            <Spin spinning={this.props.loading} style={{width: "100%"}}>
            </Spin>
        )
    }

    handleCustomInputChange(kind, key, event) {
        // todo fix this +, doesnt take 1.
        this.customElement[kind][key] = +event.target.value;
        this.setState({
            ...this.state,
            customPrimaryElement: this.customElement.primary,
            customSecondaryElement: this.customElement.secondary
        });
    }
}
