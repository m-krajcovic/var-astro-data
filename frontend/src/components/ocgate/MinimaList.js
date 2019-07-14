import React, {Component} from "react";
import {Card, Tabs, Input} from "antd";

export default class MinimaList extends Component {
    constructor(props) {
        super(props);
        this.state = {tab: "db"}
    }

    render() {
        return (
            <Card style={{height: 600, maxWidth: 900}} bodyStyle={{height: "100%", paddingTop: 0}}>
                <Tabs defaultActiveKey="1">
                    <Tabs.TabPane tab="Database" key="1" style={{height: 532, overflow: "auto", marginBottom: 8}}>
                        <DatabaseMinimaList minimaList={this.props.minimaList}/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Custom" key="2">
                        <CustomInputMinima onCustomMinimaChange={this.props.onCustomMinimaChange}/>
                    </Tabs.TabPane>
                </Tabs>
            </Card>
        );
    }
}

class DatabaseMinimaList extends Component {
    render() {
        return (
            <table style={{paddingLeft: 0, borderSpacing: "20px 0", borderCollapse: "separate"}}>
                <thead>
                <tr>
                    <th>Julian Date</th>
                    <th>Epoch</th>
                    <th>O-C</th>
                    <th>Kind</th>
                    <th>Method</th>
                    <th>Observer</th>
                    <th>Publications</th>
                </tr>
                </thead>
                <tbody>
                {
                    this.props.minimaList.map(minima => {
                        return (
                            <tr key={minima.type + "#" + minima.julianDate}>
                                <td align="right">{minima.julianDate.toFixed(5)}</td>
                                <td align="right">{minima.epoch}</td>
                                <td align="right">{minima.oc.toFixed(5)}</td>
                                <td align="left">{minima.element.kind.name}</td>
                                <td align="left">{minima.method.name}</td>
                                <td align="left">{minima.observer}</td>
                                <td align="left">{minima.publicationEntries.map(entry => `${entry.publication.name}/${entry.volume.name}`).join(", ")}</td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        );
    }

}

class CustomInputMinima extends Component {
    constructor(props) {
        super(props);
        this.state = {errorLines: [], textAreaValue: ''};
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

    render() {
        return (
            <div className={`loadable ${this.state.loading ? 'loading' : ''}`}>
                <div className="text-error">
                    {this.state.errorLines.length > 0 ? `Could not load values from lines: ${this.state.errorLines.join(',')}` : ''}
                </div>
                <div className="mono">Example line: 2451234.678 P/S</div>
                <Input.TextArea
                    value={this.state.textAreaValue}
                    onInput={(e) => this.handleTextAreaInput(e)}
                    autosize={{minRows: 6}}
                />
            </div>
        );
    }
}
