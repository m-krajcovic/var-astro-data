import React, {Component} from "react";
import {Redirect, Route, Switch} from "react-router-dom";
import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    Form,
    Input,
    Modal,
    notification,
    Radio,
    Row,
    Spin
} from "antd";
import {CzevStarDraftsTable} from "../CzevStarDraftsTable";
import axios from "axios";
import {BASE_URL} from "../../../api-endpoint";
import {CzevStarDraftSingleStarFormItems} from "../CzevStarDraftSingleStarFormItems";
import {CoordsInfoResultsWrapper, NameInfoResultsWrapper} from "../CzevStarDraftSingleNewStar";
import {CdsCallsHolder} from "../../common/CdsCallsHolder";
import {UploadedFilesListFormItem} from "../UploadedFilesList";
import {AdditionalFilesUpload} from "../AdditionalFilesUpload";


export default class CzevAdmin extends Component {
    render() {
        return (
            <Switch>
                <Route path="/czev/admin/drafts/:id"
                       render={props => (<CzevAdminDraftDetailWithForm {...props} entities={this.props.entities}/>)}/>
                <Route path="/czev/admin/drafts"
                       render={props => (<CzevAdminDrafts {...props} entities={this.props.entities}/>)}/>
            </Switch>
        )
    }
}

export class CzevAdminDrafts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: 'waiting',
            waitingDrafts: [],
            rejectedDrafts: [],
            draftsLoading: false,
        }
    }

    componentDidMount() {
        this.setState({...this.state, draftsLoading: true});
        axios.get(BASE_URL + "/czev/drafts")
            .then(result => {
                const waitingDrafts = [];
                const rejectedDrafts = [];
                result.data.forEach(draft => {
                    if (draft.rejected) {
                        rejectedDrafts.push(draft);
                    } else {
                        waitingDrafts.push(draft);
                    }
                });
                this.setState({...this.state, draftsLoading: false, waitingDrafts, rejectedDrafts})
            });
    }

    handleRadioGroupChange = (e) => {
        this.setState({...this.state, mode: e.target.value})
    };

    handleRowClick = (draft) => {
        this.props.history.push('/czev/admin/drafts/' + draft.id)
    };

    render() {
        return (
            <Card>
                <Radio.Group onChange={this.handleRadioGroupChange} defaultValue="waiting" style={{marginBottom: 8}}>
                    <Radio.Button value="waiting">Waiting for approval<Badge style={{marginLeft: 4, top: -1}}
                                                                             showZero={false}
                                                                             count={this.state.waitingDrafts.length}/></Radio.Button>
                    <Radio.Button value="rejected">Rejected<Badge style={{marginLeft: 4, top: -1}} showZero={false}
                                                                  count={this.state.rejectedDrafts.length}/></Radio.Button>
                </Radio.Group>
                <CzevStarDraftsTable
                    onRowClick={this.handleRowClick} showCreatedBy={true}
                    data={this.state.mode === 'waiting' ? this.state.waitingDrafts : this.state.rejectedDrafts}
                    loading={this.state.draftsLoading}/>
            </Card>
        )
    }
}

export class CzevAdminDraftDetail extends Component {
    render() {
        return (
            <CdsCallsHolder>
                <CzevAdminDraftDetailComponent {...this.props}/>
            </CdsCallsHolder>
        )
    }
}

class CzevAdminDraftDetailComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            originalDraft: null,
            draftLoading: false,
            newFiles: [],
            deletedFiles: [],
            finished: false,
            rejectionVisible: false
        };
    }

    componentDidMount() {
        this.setState({
            ...this.state,
            draftLoading: true
        });
        axios.get(`${BASE_URL}/czev/drafts/${this.props.match.params.id}`)
            .then(result => {
                const draft = result.data;
                let newFormValues = {
                    constellation: "" + draft.constellation.id,
                    type: draft.type,
                    discoverers: draft.discoverers.map(d => "" + d.id),
                    amplitude: draft.amplitude,
                    filterBand: draft.filterBand ? "" + draft.filterBand.id : null,
                    crossIds: draft.crossIdentifications,
                    coordinatesRa: draft.coordinates.ra,
                    coordinatesDec: draft.coordinates.dec,
                    note: draft.publicNote,
                    epoch: draft.m0,
                    period: draft.period,
                    year: draft.year,
                    jmagnitude: draft.jmagnitude,
                    vmagnitude: draft.vmagnitude,
                    kmagnitude: draft.kmagnitude
                };
                this.props.form.setFieldsValue({
                    crossidKeys: [...Array(draft.crossIdentifications.length).keys()],
                });
                this.props.form.setFieldsValue(newFormValues);
                this.props.form.validateFieldsAndScroll();
                this.setState({...this.state, originalDraft: draft, draftLoading: false});
                this.handleCoordsBlur();
                this.handleCrossIdBlur();
            });
    }

    handleReject = (reason) => {
        const component = this;
        axios.post(`${BASE_URL}/czev/drafts/${this.props.match.params.id}/rejection`, {
            id: this.props.match.params.id,
            rejectionNote: reason
        })
            .then(result => {
                component.setState({...component.state, finished: true});
                notification.success({
                    message: 'Variable star discovery rejected'
                });
            })
            .catch(e => {
                notification.error({
                    message: 'Failed to reject variable star discovery',
                    description: e.response.data.message,
                });
            })
    };

    handleApproval = (e) => {
        e.preventDefault();
        const component = this;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                Modal.confirm({
                    title: 'Are you sure you want to approve this variable star discovery?',
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk() {

                        const formData = new FormData();
                        component.state.newFiles.forEach(file => {
                            formData.append('newFiles', file);
                        });
                        component.state.deletedFiles.forEach(file => {
                            formData.append('deletedFiles', file);
                        });
                        formData.append('id', component.props.match.params.id);
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

                        // const body = {
                        //     id: component.props.match.params.id,
                        //     constellation: values.constellation,
                        //     type: values.type ? values.type : "",
                        //     discoverers: values.discoverers,
                        //     amplitude: values.amplitude,
                        //     filterBand: values.filterBand,
                        //     crossIdentifications: values.crossIds,
                        //     coordinates: {ra: values.coordinatesRa, dec: values.coordinatesDec},
                        //     publicNote: values.note ? values.note : "",
                        //     privateNote: "",
                        //     m0: values.epoch,
                        //     period: values.period,
                        //     year: values.year,
                        //     jmagnitude: values.jmagnitude,
                        //     vmagnitude: values.vmagnitude,
                        //     kmagnitude: values.kmagnitude
                        // };
                        return axios.post(BASE_URL + "/czev/stars", formData)
                            .then(result => {
                                component.setState({...component.state, finished: true});
                                notification.success({
                                    message: 'Variable star discovery approved'
                                });
                            })
                            .catch(e => {
                                notification.error({
                                    message: 'Failed to approve variable star discovery',
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
        this.handleCoordsBlur();
        this.handleCrossIdBlur();
    };

    render() {
        if (this.state.finished) {
            return (
                <Redirect to="/czev/admin/drafts"/>
            )
        }
        const {originalDraft} = this.state;
        return (
            <Spin spinning={this.state.draftLoading}>
                <Card>
                    {originalDraft && originalDraft.rejected && (
                        <Row style={{marginBottom: 12}}>
                            <Col span={24}>
                                <Alert
                                    showIcon
                                    type="error"
                                    message={"This draft has been rejected on " + originalDraft.rejectedOn}
                                    description={`Reason: ${originalDraft.rejectedReason}`}
                                />
                            </Col>
                        </Row>
                    )}
                    <Row gutter={8}>
                        <Col span={24} sm={{span: 16}}>
                            <Form onSubmit={this.handleApproval}>
                                <CzevStarDraftSingleStarFormItems
                                    form={this.props.form}

                                    onCoordsBlur={this.handleCoordsBlur}
                                    onCrossIdBlur={this.handleCrossIdBlur}
                                    onCrossIdSearch={this.handleCrossIdSearch}

                                    entities={this.props.entities}
                                />
                                {originalDraft && <UploadedFilesListFormItem onChange={(deletedFiles) => this.setState({...this.state, deletedFiles})} files={originalDraft.files}/>}
                                <AdditionalFilesUpload onChange={(newFiles) => this.setState({...this.state, newFiles})}/>
                                <Form.Item
                                    wrapperCol={{
                                        xs: {span: 24, offset: 0},
                                        sm: {span: 18, offset: 6},
                                    }}
                                >
                                    <Button type="danger" htmlType="button"
                                            onClick={() => this.setState({...this.state, rejectionVisible: true})}
                                            style={{marginRight: 8}}>Reject</Button>
                                    <RejectionModal onOk={this.handleReject}
                                                    onCancel={() => this.setState({
                                                        ...this.state,
                                                        rejectionVisible: false
                                                    })}
                                                    visible={this.state.rejectionVisible}/>
                                    <Button type="primary" htmlType="submit">Update &amp; Approve</Button>
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
                </Card>
            </Spin>
        );
    }
}

class RejectionModal extends Component {
    static defaultProps = {
        visible: false,
        onOk: () => {
        },
        onCancel: () => {
        }
    };

    constructor(props) {
        super(props);
        this.state = {reason: ''}
    }

    render() {
        return (
            <Modal
                visible={this.props.visible}
                title="Draft rejection"
                onOk={() => this.props.onOk(this.state.reason)}
                onCancel={this.props.onCancel}
            >
                <Input.TextArea onChange={val => this.setState({reason: val.target.value})}
                                placeholder="Rejection reason"/>
            </Modal>
        );
    }
}

const CzevAdminDraftDetailWithForm = Form.create()(CzevAdminDraftDetail);
