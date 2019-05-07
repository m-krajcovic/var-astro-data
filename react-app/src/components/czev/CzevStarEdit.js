import React, {Component} from "react";
import {CdsCallsHolder} from "../common/CdsCallsHolder";
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";
import {Button, Card, Col, Modal, notification, Row, Spin, Form} from "antd";
import {Redirect} from "react-router-dom";
import {CzevStarDraftSingleStarFormItems} from "./CzevStarDraftSingleStarFormItems";
import {CoordsInfoResultsWrapper, NameInfoResultsWrapper} from "./CzevStarDraftSingleNewStar";
import {UploadedFilesListFormItem} from "./UploadedFilesList";
import {AdditionalFilesUpload} from "./AdditionalFilesUpload";

class CzevStarEditComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            originalStar: null,
            starLoading: false,
            newFiles: [],
            deletedFiles: [],
            finished: false,
        };
    }

    componentDidMount() {
        this.setState({
            ...this.state,
            starLoading: true
        });
        axios.get(BASE_URL + "/czev/stars/" + this.props.match.params.id)
            .then(result => {
                const star = result.data;
                let newFormValues = {
                    constellation: "" + star.constellation.id,
                    type: star.type,
                    discoverers: star.discoverers.map(d => "" + d.id),
                    amplitude: star.amplitude,
                    filterBand: star.filterBand ? "" + star.filterBand.id : null,
                    crossIds: star.crossIdentifications,
                    "coordinates.ra": star.coordinates.ra,
                    "coordinates.dec": star.coordinates.dec,
                    note: star.publicNote,
                    epoch: star.m0,
                    period: star.period,
                    year: star.year,
                    jmagnitude: star.jmagnitude,
                    kmagnitude: star.kmagnitude,
                    vmagnitude: star.vmagnitude
                };
                this.props.form.setFieldsValue({
                    crossidKeys: [...Array(star.crossIdentifications.length).keys()],
                });
                this.props.form.setFieldsValue(newFormValues);
                this.props.form.validateFieldsAndScroll();
                this.setState({...this.state, originalStar: star, starLoading: false});
                this.handleCoordsBlur();
                this.handleCrossIdBlur();
            });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const component = this;
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                Modal.confirm({
                    title: 'Are you sure you want to update this variable star discovery?',
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
                        formData.append('czevId', component.props.match.params.id);
                        formData.append('constellation', values.constellation);
                        formData.append('type', values.type ? values.type : "");
                        values.discoverers.forEach(disc => {
                            formData.append('discoverers', disc);
                        });
                        values.crossIds.forEach(id => {
                            formData.append('crossIdentifications', id);
                        });
                        formData.append('rightAscension', values.coordinates.ra);
                        formData.append('declination', values.coordinates.dec);
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
                        //     czevId: component.props.match.params.id,
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
                        //     kmagnitude: values.kmagnitude,
                        //     vsxName: ""
                        // };
                        return axios.put(BASE_URL + "/czev/stars/" + component.props.match.params.id, formData)
                            .then(result => {
                                component.setState({...component.state, finished: true});
                                notification.success({
                                    message: (<span>Variable star discovery updated</span>)
                                });
                            })
                            .catch(e => {
                                notification.error({
                                    message: 'Failed to update variable star discovery',
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
        validateFields(["coordinates.ra", "coordinates.dec"], (err, values) => {
            if (!err && values && values.coordinates.ra && values.coordinates.dec) {
                this.props.cds.loadByCoordinates({
                    ra: values.coordinates.ra,
                    dec: values.coordinates.dec
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
            "coordinates.ra": model.coordinates.ra,
            "coordinates.dec": model.coordinates.dec,
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
                <Redirect to={"/czev/" + this.props.match.params.id}/>
            )
        }
        const {originalStar} = this.state;
        return (
            <Spin spinning={this.state.starLoading}>
                <Card>
                    <Row gutter={8}>
                        <Col span={24} sm={{span: 16}}>
                            <Form onSubmit={this.handleSubmit}>
                                <CzevStarDraftSingleStarFormItems
                                    form={this.props.form}

                                    onCoordsBlur={this.handleCoordsBlur}
                                    onCrossIdBlur={this.handleCrossIdBlur}
                                    onCrossIdSearch={this.handleCrossIdSearch}

                                    entities={this.props.entities}
                                />
                                {originalStar && <UploadedFilesListFormItem onChange={(deletedFiles) => this.setState({...this.state, deletedFiles})} files={originalStar.files}/>}
                                <AdditionalFilesUpload onChange={(newFiles) => this.setState({...this.state, newFiles})}/>
                                <Form.Item
                                    wrapperCol={{
                                        xs: {span: 24, offset: 0},
                                        sm: {span: 18, offset: 6},
                                    }}
                                >
                                    <Button type="primary" htmlType="submit">Update</Button>
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
        )
    }
}

 class CzevStarEditWithCds extends Component {
    render() {
        return (
            <CdsCallsHolder>
                <CzevStarEditComponent {...this.props}/>
            </CdsCallsHolder>
        )
    }
}

export const CzevStarEdit = Form.create()(CzevStarEditWithCds);
