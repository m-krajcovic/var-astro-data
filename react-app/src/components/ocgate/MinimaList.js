import React, {Component} from "react";

export default class MinimaList extends Component {
    constructor(props) {
        super(props);
        this.state = {tab: "db", errorLines: [], textAreaValue: ''}
    }

    render() {
        return (
            <div className="panel minima-list" style={{height: 600, overflow: "auto", maxWidth: 900}}>
                <div className="tab-wrapper">
                    <span className={`tab-item ${this.state.tab === "db" ? "selected" : ""}`}
                          onClick={() => this.setState({...this.state, tab: "db"})}
                    >Database</span>
                    <span className={`tab-item ${this.state.tab === "custom" ? "selected" : ""}`}
                          onClick={() => this.setState({...this.state, tab: "custom"})}
                    >Custom</span>
                </div>
                <div className="panel-body">
                    {this.state.tab === 'db' ? (
                        <table style={{paddingLeft: 0}}>
                            <thead>
                            <tr>
                                <th align="right">Julian Date</th>
                                <th align="right">Epoch</th>
                                <th align="right">O-C</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.props.minimaList.map(minima => {
                                    return (
                                        <tr key={minima.minima.id}>
                                            <td align="right">{minima.jd.toFixed(5)}</td>
                                            <td align="right">{minima.epoch}</td>
                                            <td align="right">{minima.oc.toFixed(5)}</td>
                                        </tr>
                                    )
                                })
                            }
                            </tbody>
                        </table>
                    ) : (
                        <div className={`loadable ${this.state.loading ? 'loading' : ''}`}>
                            <div className="text-error">
                                {this.state.errorLines.length > 0 ? `Could not load values from lines: ${this.state.errorLines.join(',')}` : ''}
                            </div>
                            <div className="mono">Example line: 2451234.678 p/s</div>
                            <textarea value={this.state.textAreaValue}
                                      style={{maxWidth: "100%", height: "100%", width: "100%"}}
                                      onInput={(e) => this.handleTextAreaInput(e)}/>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    handleTextAreaInput(event) {
        const text = event.target.value;
        this.setState({...this.state, textAreaValue: text, loading: false});
        window.clearTimeout(this.showLoadingTimeoutHandle);
        this.showLoadingTimeoutHandle = window.setTimeout(() => {
            this.setState({...this.state, loading: true});
        }, 400);
        window.clearTimeout(this.customMinimaChangeTimeoutHandle);
        this.customMinimaChangeTimeoutHandle = window.setTimeout(() => {
            const errorLines = [];
            if (this.props.onCustomMinimaChange) {
                const lines = text.split("\n");
                const output = [];
                lines.forEach((line, index) => {
                    const lineValues = line.trim().split(/\s+/);
                    if (lineValues.length >= 2) {
                        const julianDate = lineValues[0];
                        const kind = lineValues[1];
                        if (!isNaN(julianDate) && (kind === 'p' || kind === 's')) {
                            output.push({julianDate: +julianDate, kind});
                        } else {
                            errorLines.push(index + 1);
                        }
                    } else if (line) {
                        errorLines.push(index + 1);
                    }
                });
                this.props.onCustomMinimaChange(output);
            }
            this.setState({...this.state, loading: false, errorLines: errorLines});
        }, 1400);
    }
}
