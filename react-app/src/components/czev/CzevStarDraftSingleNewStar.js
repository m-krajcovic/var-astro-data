import React, {Component} from "react";
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";
import {Alert, Button, Col, Form, Icon, List, Modal, notification, Row, Spin, Tooltip, message, Upload} from "antd";
import {CzevStarDraftSingleStarFormItems} from "./CzevStarDraftSingleStarFormItems";
import {Link, Redirect} from "react-router-dom";
import {CoordinateWrapper} from "../common/CoordinateWrapper";
import {Copyable} from "../common/Copyable";
import AnimateHeight from "react-animate-height";
import {CdsCallsHolder} from "../common/CdsCallsHolder";
import StarMap from "../common/StarMap";
import {AdditionalFilesUpload} from "./AdditionalFilesUpload";

class StarDraftSingleNewStarComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            finished: false,
            files: []
        };
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const component = this;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                Modal.confirm({
                    title: 'Are you sure you want to submit this variable star discovery?',
                    content: 'Discovery will have to go through approval before appearing in the CzeV catalogue',
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk() {
                        const formData = new FormData();
                        component.state.files.forEach(file => {
                            formData.append('files', file);
                        });
                        formData.append('constellation', values.constellation);
                        formData.append('type', values.type ? values.type : "");
                        values.discoverers.forEach(disc => {
                            formData.append('discoverers', disc);
                        });
                        values.crossIds.forEach(id => {
                            formData.append('crossIdentifications', id);
                        });
                        formData.append('rightAscension', values.coordinatesRa);
                        formData.append('declination', values.coordinatesDec);
                        formData.append('publicNote', values.note ? values.note : "");
                        formData.append('privateNote', "");
                        formData.append('year', values.year);
                        if (values.amplitude) formData.append('amplitude', values.amplitude);
                        if (values.filterBand) formData.append('filterBand', values.filterBand);
                        if (values.epoch) formData.append('m0', values.epoch);
                        if (values.period) formData.append('period', values.period);
                        if (values.jmagnitude) formData.append('jmagnitude', values.jmagnitude);
                        if (values.vmagnitude) formData.append('vmagnitude', values.vmagnitude);
                        if (values.kmagnitude) formData.append('kmagnitude', values.kmagnitude);

                        return axios({
                            method: 'post', url: BASE_URL + "/czev/drafts", data: formData
                        }).then(result => {
                            component.setState({...component.state, finished: true});
                            notification.success({
                                message: (<span>Variable star discovery submitted</span>)
                            });
                        }).catch(e => {
                            notification.error({
                                message: 'Failed to submit variable star discovery',
                                description: e.response.data.message,
                            });
                        })
                    },
                    onCancel() {
                    },
                });
            }
        });
    };

    handleCoordsBlur = () => {
        const {form: {validateFields}} = this.props;
        validateFields(["coordinatesRa", "coordinatesDec"], (err, values) => {
            if (!err && values && values.coordinatesRa && values.coordinatesDec) {
                this.props.cds.loadByCoordinates({
                    ra: values.coordinatesRa,
                    dec: values.coordinatesDec
                });
            }
        });
    };

    handleCrossIdBlur = () => {
        const {form: {validateFields}} = this.props;
        validateFields(["crossIds[0]"], (err, values) => {
            if (!err && values && values.crossIds[0]) {
                this.props.cds.loadByName(values.crossIds[0]);
            }
        });
    };

    handleCrossIdSearch = (id) => {
        this.props.cds.loadByName(id);
    };

    handleUcacCopy = (model) => {
        const {form} = this.props;
        const {J, K, V} = model.magnitudes;
        let valuesFromUcac = {
            coordinatesRa: model.coordinates.ra,
            coordinatesDec: model.coordinates.dec,
            "crossIds[0]": `UCAC4 ${model.identifier}`,
            vmagnitude: V,
            jmagnitude: J,
            kmagnitude: K
        };
        form.setFieldsValue(valuesFromUcac);
        message.info('Copied');
        this.handleCoordsBlur();
        this.handleCrossIdBlur();
    };

    render() {
        if (this.state.finished) {
            return (
                <Redirect to="/czev/user/drafts"/>
            )
        }
        return (
            <Row gutter={8}>
                <Col span={24} sm={{span: 16}}>
                    <Form onSubmit={this.handleSubmit}>
                        <CzevStarDraftSingleStarFormItems
                            form={this.props.form}

                            onCoordsBlur={this.handleCoordsBlur}
                            onCrossIdBlur={this.handleCrossIdBlur}
                            onCrossIdSearch={this.handleCrossIdSearch}

                            onSubmit={this.handleSubmit}

                            entities={this.props.entities}
                        />
                        <AdditionalFilesUpload onChange={(files) => this.setState({...this.state, files})}/>
                        <Form.Item
                            wrapperCol={{
                                xs: {span: 24, offset: 0},
                                sm: {span: 18, offset: 6},
                            }}
                        >
                            <Button type="primary" htmlType="submit">Submit for approval</Button>
                        </Form.Item>
                    </Form>
                </Col>
                <Col span={24} sm={{span: 8}}>
                    <Spin style={{minHeight: "100px", width: "100%"}}
                          tip="Searching other catalogues by coordinates"
                          spinning={this.props.cds.coordsInfoLoading}>
                        {this.props.cds.coordsInfoResult && (
                            <CoordsInfoResultsWrapper onUcacCopy={this.handleUcacCopy}
                                                      coords={this.props.cds.coordsInfoParams}
                                                      result={this.props.cds.coordsInfoResult}/>
                        )}
                    </Spin>
                    <Spin spinning={this.props.cds.nameInfoLoading} style={{minHeight: 100, width: "100%"}}
                          tip="Searching other catalogues by id">
                        {this.props.cds.nameInfoResult && (
                            <NameInfoResultsWrapper onUcacCopy={this.handleUcacCopy}
                                                    name={this.props.cds.nameInfoParams}
                                                    result={this.props.cds.nameInfoResult}/>
                        )}
                    </Spin>
                </Col>
            </Row>
        );
    }
}

export class StarDraftSingleNewStarWithCds extends Component {
    render() {
        return (
            <CdsCallsHolder>
                <StarDraftSingleNewStarComponent {...this.props}/>
            </CdsCallsHolder>
        )
    }
}

export const CzevStarDraftSingleNewStar = Form.create()(StarDraftSingleNewStarWithCds);


export class CoordsInfoResultsWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mapVisible: false, onUcacCopy: () => {
            }
        };
    }

    render() {
        const {result} = this.props;
        if (!result) {
            return (<div/>);
        }
        const {vsx, czev, ucac4} = result;
        return (
            <div style={{marginBottom: 8}}>
                <h4>Coordinates search <Icon type="eye" className="clickable-icon" onClick={() => {
                    this.setState({mapVisible: true})
                }}/></h4>
                <Modal
                    footer={null}
                    centered
                    visible={this.state.mapVisible}
                    closable={false}
                    onCancel={() => this.setState({mapVisible: false})}
                >
                    <StarMap fov={0.1} coordinates={this.props.coords} catalog={true} onCopy={this.props.onUcacCopy}/>
                </Modal>
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
                <Ucac4ResultWrapper ucac4={ucac4} onCopy={this.props.onUcacCopy}/>
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

export class NameInfoResultsWrapper extends Component {
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
                <Ucac4ResultWrapper ucac4={ucac4} onCopy={this.props.onUcacCopy}/>
                <SesameResultWrapper sesame={sesame}/>
            </div>
        )
    }
}

function Ucac4ResultWrapper(props) {
    return (
        <StarInfoResultWrapper
            title="UCAC4"
            successOnZero={false}
            results={props.ucac4 ? [].concat(props.ucac4) : []}
            style={{marginBottom: 4}}
            message={(<span><b>UCAC4: </b>{!props.ucac4 && "No result"}</span>)}
            renderItem={item => {
                const hasDistance = item.distance !== undefined;
                const model = hasDistance ? item.model : item;
                return (
                    <List.Item>
                        <div>
                            <div>
                                <span style={{color: "#1890ff"}}>UCAC4 {model.identifier}</span>
                                {hasDistance && <DistanceWrapper distance={item.distance}/>}
                            </div>
                            <div>
                                                       <span style={{display: "inline-block", marginRight: 4}}>
                                                            RA: <CoordinateWrapper size="large"
                                                                                   value={model.coordinates.ra}/>
                                                       </span>
                                <span style={{display: "inline-block"}}>
                                                           DEC: <CoordinateWrapper size="large"
                                                                                   value={model.coordinates.dec}/>
                                                       </span>
                            </div>
                            <div>
                                {Object.keys(model.magnitudes).map(k => (
                                    <span key={k} style={{marginRight: 4}}><b>{k}: </b> <Copyable
                                        value={model.magnitudes[k]}/></span>
                                ))}
                            </div>
                        </div>
                        <Tooltip title="Copy to form">
                            <Button
                                onClick={() => {
                                    if (props.onCopy) {
                                        props.onCopy(model)
                                    }
                                }}
                                style={{alignSelf: "center", marginLeft: 12}} type="ghost"
                                shape="circle"
                                icon="copy"/>
                        </Tooltip>
                    </List.Item>
                )
            }}/>
    )
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
                                        RA: <CoordinateWrapper size="large" value={item.coordinates.ra}/>
                                    </span>
                                    <span style={{display: "inline-block"}}>
                                            DEC: <CoordinateWrapper size="large" value={item.coordinates.dec}/>
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

