import React, {Component} from "react";
import {Card, Input, Tabs} from "antd";
import {AnchorButton} from "../common/AnchorButton";

export default class MinimaList extends Component {
    constructor(props) {
        super(props);
        this.state = {tab: "db"}
    }

    handleDownload = () => {
        const csv = this.props.minimaList.map(m => [m.julianDate.toFixed(5), m.epoch, m.oc.toFixed(5), m.type, m.observer, m.instrument, m.publicationEntries.map(entry => `${entry.publication.name}/${entry.volume.name}`).join(", ")].join(",")).join("\n");
        const pom = document.createElement('a');
        const blob = new Blob(["Julian Date, Epoch, O-C, Type, Observer, Instrument, Publications\n" + csv],{type: 'text/csv;charset=utf-8;'});
        pom.href = URL.createObjectURL(blob);
        pom.setAttribute('download', (this.props.star ? `${this.props.star.name} ${this.props.star.constellation.name}_OC_export` : 'OC_export' ) +'.csv');
        pom.click();
    };

    render() {
        return (
            <Card style={{height: 600, maxWidth: 900}} bodyStyle={{height: "100%", paddingTop: 0}}>
                <AnchorButton disabled={!this.props.minimaList} onClick={this.handleDownload} icon="download" style={{position: "absolute", right: 16, top: 0, padding: "12px 16px", zIndex: 10, height: "auto"}}>Download</AnchorButton>
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
            <table style={{fontSize: "0.7rem", paddingLeft: 0, borderSpacing: "10px 0", borderCollapse: "separate"}}>
                <thead>
                <tr>
                    <th>Julian Date</th>
                    <th>Epoch</th>
                    <th>O-C</th>
                    <th>Type</th>
                    <th>Observer</th>
                    <th>Instrument</th>
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
                                <td align="left">{minima.type}</td>
                                <td align="left">{minima.observer}</td>
                                <td align="left">{minima.instrument}</td>
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
