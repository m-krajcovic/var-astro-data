import React, {Component} from "react";
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";
import {Alert, Button, Col, Modal, notification, Row, Spin, Tooltip, List} from "antd";
import {StarDraftSingleStarForm} from "./StarDraftSingleStarForm";
import {Link} from "react-router-dom";
import {CoordinateWrapper} from "./CoordinateWrapper";
import {Copyable} from "./Copyable";
import AnimateHeight from "react-animate-height";

export class StarDraftSingleNewStar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            constellations: [],
            observers: [],
            types: [],
            filterBands: [],
            constellationsLoading: false,
            filterBandsLoading: false,
            typesLoading: false,
            observersLoading: false,


            coordsInfoParams: {},
            coordsInfoLoading: false,
            coordsInfoResult: null,

            nameInfoParams: {},
            nameInfoLoading: false,
            nameInfoResult: null
        };
    }

    componentDidMount() {
        this.setState({
            ...this.state,
            constellationsLoading: true,
            observersLoading: true,
            filterBandsLoading: true,
            typesLoading: true
        });
        axios.get(BASE_URL + "/czev/constellations")
            .then(result => {
                this.setState({...this.state, constellationsLoading: false, constellations: result.data});
            });
        axios.get(BASE_URL + "/czev/types")
            .then(result => {
                this.setState({...this.state, typesLoading: false, types: new Set(result.data)});
            });
        axios.get(BASE_URL + "/czev/filterBands")
            .then(result => {
                this.setState({...this.state, filterBandsLoading: false, filterBands: result.data});
            });
        axios.get(BASE_URL + "/czev/observers")
            .then(result => {
                this.setState({...this.state, observersLoading: false, observers: result.data});
            });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const {history} = this.props;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                Modal.confirm({
                    title: 'Are you sure you want to submit this variable star discovery?',
                    content: 'Discovery will have to go through approval before appearing in the CzeV catalogue',
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk() {
                        const body = {
                            constellation: values.constellation,
                            type: values.type ? values.type : "",
                            discoverers: values.discoverers,
                            amplitude: values.amplitude,
                            filterBand: values.filterBand,
                            crossIdentifications: values.crossIds,
                            coordinates: {ra: values.coordinatesRa, dec: values.coordinatesDec},
                            publicNote: values.note ? values.note : "",
                            privateNote: "",
                            m0: values.epoch,
                            period: values.period,
                            year: values.year
                        };
                        return axios.post(BASE_URL + "/czev/drafts", body)
                            .then(result => {
                                history.push("/czev");
                                notification.success({
                                    message: 'Variable star discovery submitted'
                                });
                            })
                            .catch(e => {
                                notification.error({
                                    message: 'Failed to submit variable star discovery',
                                    description: e.response.data.message,
                                });
                            })
                    },
                    onCancel() {
                        console.log('Cancel');
                    },
                });
            }
        });
    };

    handleCoordsBlur = () => {
        const {form: {validateFields}} = this.props;
        validateFields(["coordinatesRa", "coordinatesDec"], (err, values) => {
            if (!err && values && values.coordinatesRa && values.coordinatesDec) {
                if (this.state.coordsInfoParams.coordinatesRa !== values.coordinatesRa
                    || this.state.coordsInfoParams.coordinatesDec !== values.coordinatesDec) {
                    this.setState({...this.state, coordsInfoParams: values, coordsInfoLoading: true});
                    axios.get(BASE_URL + "/czev/cds/all", {
                        params: {
                            ra: values.coordinatesRa,
                            dec: values.coordinatesDec
                        }
                    }).then(result => {
                        this.setState({...this.state, coordsInfoResult: result.data, coordsInfoLoading: false})
                    })
                }
            }
        });
    };

    handleCrossIdBlur = () => {
        const {form: {validateFields}} = this.props;
        validateFields(["crossIds[0]"], (err, values) => {
            if (!err && values && values.crossIds[0]) {
                if (this.state.nameInfoParams !== values.crossIds[0]) {
                    this.setState({...this.state, nameInfoParams: values.crossIds[0], nameInfoLoading: true});
                    axios.get(BASE_URL + "/czev/cds/all", {
                        params: {
                            name: values.crossIds[0],
                        }
                    }).then(result => {
                        if (this.state.nameInfoParams === values.crossIds[0]) {
                            this.setState({...this.state, nameInfoResult: result.data, nameInfoLoading: false})
                        }
                    })
                }
            }
        });
    };

    handleCrossIdSearch = (id) => {
        if (id) {
            if (this.state.nameInfoParams !== id) {
                this.setState({...this.state, nameInfoParams: id, nameInfoLoading: true});
                axios.get(BASE_URL + "/czev/cds/all", {
                    params: {
                        name: id,
                    }
                }).then(result => {
                    if (this.state.nameInfoParams === id) {
                        this.setState({...this.state, nameInfoResult: result.data, nameInfoLoading: false})
                    }
                })
            }
        }
    };

    handleUcacCopy = (model) => {
        const {form} = this.props;
        form.setFieldsValue({
            coordinatesRa: model.coordinates.ra,
            coordinatesDec: model.coordinates.dec,
            "crossIds[0]": `UCAC4 ${model.identifier}`,
        });
        this.handleCoordsBlur();
        this.handleCrossIdBlur();
    };

    render() {
        return (
            <Row gutter={8}>
                <Col span={24} sm={{span: 16}}>
                    <StarDraftSingleStarForm
                        form={this.props.form}

                        onCoordsBlur={this.handleCoordsBlur}
                        onCrossIdBlur={this.handleCrossIdBlur}
                        onCrossIdSearch={this.handleCrossIdSearch}

                        onSubmit={this.handleSubmit}

                        constellations={this.state.constellations}
                        observers={this.state.observers}
                        types={this.state.types}
                        filterBands={this.state.filterBands}

                        constellationsLoading={this.state.constellationsLoading}
                        observersLoading={this.state.observersLoading}
                        typesLoading={this.state.typesLoading}
                        filterBandsLoading={this.state.filterBandsLoading}
                    />
                </Col>
                <Col span={24} sm={{span: 8}}>
                    <Spin style={{minHeight: "100px", width: "100%"}}
                          tip="Searching other catalogues by coordinates"
                          spinning={this.state.coordsInfoLoading}>
                        {this.state.coordsInfoResult && (
                            <CoordsInfoResultsWrapper onUcacCopy={this.handleUcacCopy}
                                                      coords={this.state.coordsInfoParams}
                                                      result={this.state.coordsInfoResult}/>
                        )}
                    </Spin>
                    <Spin spinning={this.state.nameInfoLoading} style={{minHeight: 100, width: "100%"}}
                          tip="Searching other catalogues by id">
                        {this.state.nameInfoResult && (
                            <NameInfoResultsWrapper onUcacCopy={this.handleUcacCopy}
                                                    name={this.state.nameInfoParams}
                                                    result={this.state.nameInfoResult}/>
                        )}
                    </Spin>
                </Col>
            </Row>
        );
    }
}


class CoordsInfoResultsWrapper extends Component {
    render() {
        const {result} = this.props;
        if (!result) {
            return (<div/>);
        }
        const {vsx, czev, ucac4} = result;
        return (
            <div style={{marginBottom: 8}}>
                <h4>Coordinates search</h4>
                <StarInfoResultWrapper results={czev} title="CzeV" successOnZero style={{marginBottom: 4}}
                                       renderItem={item => (
                                           <List.Item>
                                               <div>
                                                   <Link to={`/czev/${item.model.czevId}`}
                                                         target="_blank">CzeV {item.model.czevId} {item.model.constellation.abbreviation}</Link>
                                                   <DistanceWrapper distance={item.distance}/>
                                               </div>
                                           </List.Item>)}
                />
                <StarInfoResultWrapper results={vsx} title="VSX" successOnZero style={{marginBottom: 4}}
                                       renderItem={item => (
                                           <List.Item>
                                               <div>
                                                   <a target="_blank"
                                                      rel="noopener noreferrer"
                                                      href={"https://www.aavso.org/vsx/index.php?view=detail.top&oid=" + item.model.vsxId}>{item.model.originalName}</a>
                                                   <DistanceWrapper distance={item.distance}/>
                                               </div>
                                           </List.Item>)}
                />
                <StarInfoResultWrapper results={ucac4} title="UCAC4" successOnZero={false}
                                       renderItem={item => (
                                           <List.Item>
                                               <div>
                                                   <div>
                                                       <span
                                                           style={{color: "#1890ff"}}>UCAC4 {item.model.identifier}</span>
                                                       <DistanceWrapper distance={item.distance}/>
                                                   </div>
                                                   <div>
                                                       <span style={{display: "inline-block", marginRight: 4}}>
                                                            RA: <CoordinateWrapper value={item.model.coordinates.ra}/>
                                                       </span>
                                                       <span style={{display: "inline-block"}}>
                                                           DEC: <CoordinateWrapper value={item.model.coordinates.dec}/>
                                                       </span>
                                                   </div>
                                               </div>
                                               <Tooltip title="Copy to form">
                                                   <Button
                                                       onClick={() => {
                                                           if (this.props.onUcacCopy) {
                                                               this.props.onUcacCopy(item.model)
                                                           }
                                                       }}
                                                       style={{alignSelf: "center", marginLeft: 12}} type="ghost"
                                                       shape="circle"
                                                       icon="copy"/>
                                               </Tooltip>
                                           </List.Item>)}
                />
            </div>
        );
    }
}

function DistanceWrapper(props) {
    return (
        <span
            style={{display: "inline-block", marginLeft: 4}}>({(props.distance * 3600).toFixed(4)} arcsec)</span>
    )
}

class NameInfoResultsWrapper extends Component {
    render() {
        const {result} = this.props;
        if (!result) {
            return (<div/>);
        }
        const {vsx, czev, ucac4, sesame} = result;
        return (
            <div style={{marginBottom: 8}}>
                <h4>Cross id search ({this.props.name})</h4>
                <StarInfoResultWrapper
                    title="CzeV"
                    successOnZero
                    results={czev ? [czev] : []}
                    style={{marginBottom: 4}}
                    message={(<span><b>CzeV: </b>{!czev && "No result"}</span>)}
                    renderItem={item => (
                        <List.Item>
                            <div>
                                <Link to={`/czev/${item.czevId}`}
                                      target="_blank">CzeV {item.czevId} {item.constellation.abbreviation}</Link>
                            </div>
                        </List.Item>
                    )}
                />
                <StarInfoResultWrapper
                    title="VSX"
                    successOnZero
                    results={vsx ? [vsx] : []}
                    style={{marginBottom: 4}}
                    message={(<span><b>VSX: </b>{!vsx && "No result"}</span>)}
                    renderItem={item => (
                        <List.Item>
                            <div>
                                <a target="_blank"
                                   rel="noopener noreferrer"
                                   href={"https://www.aavso.org/vsx/index.php?view=detail.top&oid=" + item.vsxId}>{item.originalName}</a>
                            </div>
                        </List.Item>
                    )}/>
                <StarInfoResultWrapper
                    title="UCAC4"
                    successOnZero={false}
                    results={ucac4 ? [ucac4] : []}
                    style={{marginBottom: 4}}
                    message={(<span><b>UCAC4: </b>{!ucac4 && "No result"}</span>)}
                    renderItem={item => (
                        <List.Item>
                            <div>
                                <div>
                                    <span style={{color: "#1890ff"}}>UCAC4 {item.identifier}</span>
                                </div>
                                <div>
                                                       <span style={{display: "inline-block", marginRight: 4}}>
                                                            RA: <CoordinateWrapper value={item.coordinates.ra}/>
                                                       </span>
                                    <span style={{display: "inline-block"}}>
                                                           DEC: <CoordinateWrapper value={item.coordinates.dec}/>
                                                       </span>
                                </div>
                            </div>
                            <Tooltip title="Copy to form">
                                <Button
                                    onClick={() => {
                                        if (this.props.onUcacCopy) {
                                            this.props.onUcacCopy(item)
                                        }
                                    }}
                                    style={{alignSelf: "center", marginLeft: 12}} type="ghost"
                                    shape="circle"
                                    icon="copy"/>
                            </Tooltip>
                        </List.Item>
                    )}/>
                <SesameResultWrapper sesame={sesame}/>
            </div>
        )
    }
}

class SesameResultWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {showAll: false}
    }

    render() {
        const {sesame} = this.props;
        return (
            <StarInfoResultWrapper
                title="SESAME"
                successOnZero={false}
                results={sesame ? [sesame] : []}
                style={{marginBottom: 4}}
                renderItem={item => {
                    item.names.sort((a, b) => {
                        if (a.startsWith("UCAC4")) {
                            return -2;
                        }
                        if (a.startsWith("USNO")) {
                            return -1;
                        }
                        return 0;
                    });
                    const importantNames = [];
                    const otherNames = [];
                    item.names.forEach(i => {
                        if (i.startsWith("UCAC4") || i.startsWith("USNO")) {
                            importantNames.push(i)
                        } else {
                            otherNames.push(i);
                        }
                    });
                    return (
                        <List.Item>
                            <div>
                                <div>
                                    <span style={{display: "inline-block", marginRight: 4}}>
                                        RA: <CoordinateWrapper value={item.coordinates.ra}/>
                                    </span>
                                    <span style={{display: "inline-block"}}>
                                            DEC: <CoordinateWrapper value={item.coordinates.dec}/>
                                        </span>
                                </div>
                                <List size="small" dataSource={importantNames}
                                      renderItem={i => (<List.Item><Copyable value={i}/></List.Item>)}/>
                                <AnimateHeight duration={500} height={this.state.showAll ? "auto" : 0}>
                                    <List size="small" dataSource={otherNames}
                                          style={{borderTop: "1px solid #e8e8e8"}}
                                          renderItem={i => (<List.Item>{i}</List.Item>)}/>
                                </AnimateHeight>
                                <div style={{textAlign: "center"}}>
                                    <span className="clickable-icon"
                                          onClick={() => this.setState({showAll: !this.state.showAll})}>{this.state.showAll ? "Show less" : "Show more"}</span>
                                </div>
                            </div>
                        </List.Item>
                    )
                }
                }
                message={(<span><b>SESAME: </b>{!sesame && "No result"}</span>)}
            />
        )
    }
}

function StarInfoResultWrapper(props) {
    const {results, title, renderItem, successOnZero} = props;

    const style = {};
    if (props.style) {
        Object.assign(style, props.style);
    }
    let message;
    if (props.message) {
        message = props.message
    } else {
        message = (
            <span><b>{title}: </b> {results.length} star{results.length !== 1 && "s"} nearby</span>
        );
    }
    return (
        <Alert
            style={style}
            type={((results.length === 0) && successOnZero) || (results.length > 0 && !successOnZero) ? "success" : "warning"}
            showIcon
            message={message}
            description={results.length === 0 ? null : (
                <List
                    size="small"
                    dataSource={results}
                    renderItem={renderItem}
                />
            )}
        />
    );
}
