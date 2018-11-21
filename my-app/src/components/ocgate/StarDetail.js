import React, {Component} from 'react';
import StarMinimaChart from "./StarMinimaChart";

const prependZero = function(length, number) {
    let numberStr = `${number}`;
    for (let i = 0; i < length - number; i++) {
        numberStr = "0" + numberStr;
    }
    return numberStr;
};

// const coordinatesToString = function(coords) {
//     return `${prependZero(2, coords.raHours)} ${prependZero(2, coords.raMinutes)} ${prependZero(2, coords.raSeconds)} ${coords.decSign}${prependZero(2, coords.decDegrees)} ${prependZero(2, coords.decMinutes)} ${prependZero(2, coords.decSeconds)}`;
// };

const coordinatesToStringRa = function(coords) {
    return `${prependZero(2, coords.raHours)} ${prependZero(2, coords.raMinutes)} ${prependZero(2, coords.raSeconds)}`;
};

const coordinatesToStringDec = function(coords) {
    return `${coords.decSign}${prependZero(2, coords.decDegrees)} ${prependZero(2, coords.decMinutes)} ${prependZero(2, coords.decSeconds)}`;
};

export default class StarDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {customPrimaryElement: {}, customSecondaryElement: {}};
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
            const customValuesError = (this.props.selectedElement === 'custom') && !((primaryElement.minimum0 && primaryElement.period) || (secondaryElement.minimum0 && secondaryElement.period));
            if (this.props.selectedElement === 'server' || customValuesError) {
                const elements = this.getDefaultElements();
                primaryElement = elements.primary;
                secondaryElement = elements.secondary;
            }
            return (
                <div className="star-detail-container" style={{
                    display: "flex",
                    flexDirection: "column",
                    paddingLeft: 12,
                    paddingBottom: 12,
                    paddingRight: 12,
                }}>
                    <h3 style={{flex: "0 0 auto"}}>{star.starName} {star.constellation}</h3>
                    <div style={{display: 'flex', flex: "0 0 auto", marginBottom: 12}}>
                        <div className="panel star-detail">
                            <div className="panel-header"><b>Coordinates</b></div>
                            <div className="panel-body">
                                <div><b>RA: </b>{coordinatesToStringRa(star.coordinates)}</div>
                                <div><b>DEC: </b>{coordinatesToStringDec(star.coordinates)}</div>
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
                                                                                 value={this.state.customPrimaryElement.minimum0}
                                                                                 onInput={(e) => this.handleCustomInputChange('primary', 'minimum0', e)}/>
                                    </div>
                                    <div className="space-out"><b>Period: </b><input type="text"
                                                                                     value={this.state.customPrimaryElement.period}
                                                                                     onInput={(e) => this.handleCustomInputChange('primary', 'period', e)}/>
                                    </div>
                                </div>
                                <div style={{marginRight: 12}}>
                                    <div>Secondary</div>
                                    <div className="space-out"><b>M0: </b><input type="text"
                                                                                 value={this.state.customSecondaryElement.minimum0}
                                                                                 onInput={(e) => this.handleCustomInputChange('secondary', 'minimum0', e)}/>
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
}
