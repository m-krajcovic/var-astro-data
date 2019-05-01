import React, {Component, Fragment} from "react";
import axios from "axios";
import {BASE_URL} from "../../../api-endpoint";
import {Spin, Table} from "antd";

// STAR DETAILS
//    STAR INFO
//    BRIGHTNESS
//    ELEMENTS
//        MINIMA


class StarBrightnessItem extends Component {
    render() {
        const spanStyle = {
            display: "inline-block",
            width: 80,
            marginRight: "0.5rem"
        };
        return (
            <div>
                <b style={{marginRight: "0.5rem"}}>{this.props.brightness.filter.name}:</b>
                <span style={spanStyle}>MIN S: {this.props.brightness.minS}</span>
                <span style={spanStyle}>MIN P: {this.props.brightness.minP}</span>
                <span style={spanStyle}>MAX P: {this.props.brightness.maxP}</span>
            </div>
        );
    }
}

class StarBrightnessesInfoComponent extends Component {
    render() {
        return (
            <div style={{marginTop: "0.5rem"}}>
                <h3>Brightnesses</h3>
                {this.props.brightnesses.map(b => (<StarBrightnessItem brightness={b} key={b.id}/>))}
            </div>
        )
    }
}

class StarMinimaInfoTableComponent extends Component {
    render() {
        return (
            <Table
                dataSource={this.props.minimas}
                size="small"
                className="table-small-nomargin"
            >
                <Table.Column
                    title="JD"
                    dataIndex="julianDate"
                />
                {
                    this.props.showKind && (
                        <Table.Column
                            title="Kind"
                            dataIndex="kind.name"/>
                    )
                }
                <Table.Column
                    title="Method"
                    dataIndex="method.name"
                />
            </Table>
        )
    }
}

class StarMinimaInfoComponent extends Component {
    render() {
        return (
            <div>
                <h3>Minimas</h3>
                <StarMinimaInfoTableComponent showKind={true} minimas={this.props.minimas}/>
            </div>
        )
    }
}

class StarElementItem extends Component {
    static kindNames = {
        'S': 'Secondary',
        'P': 'Primary'
    };

    constructor(props) {
        super(props);
        this.state = {minimaShow: false};
    }

    render() {
        let spanStyle = {display: "inline-block", width: 50, marginRight: "0.25rem"};
        return (
            <div>
                <b style={{marginRight: "0.5rem"}}>{StarElementItem.kindNames[this.props.element.kind.name]}:</b>
                <div><span style={spanStyle}>M0:</span> {this.props.element.minimum}</div>
                <div><span style={spanStyle}>Period:</span> {this.props.element.period}</div>
                <div>
                    <div>Minimas: {this.props.element.minimas.length} <a
                        onClick={() => this.setState({minimaShow: !this.state.minimaShow})}>{this.state.minimaShow ? 'Hide' : 'Show'}</a>
                    </div>
                    {this.state.minimaShow && (<StarMinimaInfoTableComponent minimas={this.props.element.minimas}/>)}
                </div>
            </div>
        );
    }
}

class StarElementsInfoComponent extends Component {
    render() {
        return (
            <div style={{marginTop: "0.5rem"}}>
                <h3>Elements</h3>
                {this.props.elements.map(e => (<StarElementItem element={e} key={e.id}/>))}
            </div>
        )
    }
}

class StarGenericInfoComponent extends Component {
    render() {
        return (
            <div>
                <h2>{this.props.star.name} {this.props.star.constellation.abbreviation} {this.props.star.comp && (
                    <span> ({this.props.star.comp})</span>)}</h2>
                <div><b>Constellation: </b> {this.props.star.constellation.name}</div>
            </div>
        );
    }
}

export class OcGateAdminStarDetailComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {star: null};
    }

    componentDidMount() {
        axios.get(BASE_URL + "/ocgate/stars/" + this.props.match.params.id)
            .then(result => {
                const minimas = [];
                result.data.elements.forEach(e => {
                    e.minimas.forEach(m => {
                        minimas.push({
                            julianDate: m.julianDate,
                            method: m.method,
                            kind: e.kind
                        });
                    });
                });
                minimas.sort((a, b) => {
                    return a.julianDate - b.julianDate;
                });

                this.setState({star: result.data, minimas})
            })
            .catch()
    }

    render() {
        return (
            <Spin spinning={!this.state.star}>
                {this.state.star && (
                    <Fragment>
                        <StarGenericInfoComponent star={this.state.star}/>
                        <StarBrightnessesInfoComponent brightnesses={this.state.star.brightness}/>
                        <StarElementsInfoComponent elements={this.state.star.elements}/>
                        <StarMinimaInfoComponent minimas={this.state.minimas}/>
                    </Fragment>
                )}
            </Spin>
        );
    }
}



