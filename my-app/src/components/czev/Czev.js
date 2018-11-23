import React, {Component} from "react";

import {Button, Card, Col, Form, Icon, Layout, Modal, notification, Row, Spin, Table, Tabs} from 'antd';
import {BASE_URL} from "../../api-endpoint";
import axios from "axios";
import {Link, Redirect, Route, Switch} from "react-router-dom";

import "./Czev.css";
import {CoordsInfoResultsWrapper, NameInfoResultsWrapper, StarDraftSingleNewStar} from "./StarDraftSingleNewStar";
import {CoordinateWrapper} from "./CoordinateWrapper";
import {StarDraftCsvImportWrapper} from "./StarDraftCsvImportWrapper";
import {PathBreadCrumbs} from "./PathBreadCrumbs";
import CzevAdmin from "./admin/CzevAdmin";
import CzevUser from "./user/CzevUser";
import StarMap from "./StarMap";
import {sorterToParam} from "./tableHelper";
import {CdsCallsHolder} from "./CdsCallsHolder";
import {StarDraftSingleStarFormItems} from "./StarDraftSingleStarFormItems";

const breadcrumbNameMap = {
    "/czev": "CzeV Catalogue",
    "/czev/new": "New variable star",
    "/czev/user": null,
    "/czev/user/drafts": "Your Drafts",
    "/czev/admin": "Admin",
    "/czev/admin/drafts": "Drafts"
};

export default class Czev extends Component {
    constructor(props) {
        super(props);
        this.state = {
            types: [],
            constellations: [],
            filterBands: [],
            observers: [],
            loading: false,
            reload: this.loadEntities
        }
    }

    componentDidMount() {
        this.loadEntities();
    }

    loadEntities = () => {
        this.setState({...this.state, loading: true});
        const c = axios.get(BASE_URL + "/czev/constellations");
        const t = axios.get(BASE_URL + "/czev/types");
        const fb = axios.get(BASE_URL + "/czev/filterBands");
        const o = axios.get(BASE_URL + "/czev/observers");
        Promise.all([c, t, fb, o])
            .then(result => {
                this.setState({
                    ...this.state,
                    loading: false,
                    constellations: result[0].data,
                    types: new Set(result[1].data),
                    filterBands: result[2].data,
                    observers: result[3].data
                })
            })
            .catch(e => {
                // TODO
                console.error("Failed to fetch entities");
            });
    };

    render() {
        return (
            <Layout.Content style={{margin: "24px 24px 0"}}>
                <Row>
                    <Col span={12}>
                        <PathBreadCrumbs breadcrumbNameMap={breadcrumbNameMap}/>
                    </Col>
                    {this.props.location.pathname !== "/czev/new" && (<Col span={12} style={{textAlign: "right"}}>
                        <Button type="primary" size="small"><Link to="/czev/new">Submit new variable
                            star</Link></Button>
                    </Col>)}
                </Row>
                <Switch>
                    <Route path="/czev/admin" render={props => (<CzevAdmin {...props} entities={{...this.state}}/>)}/>
                    <Route path="/czev/user" render={props => (<CzevUser {...props} entities={{...this.state}}/>)}/>
                    <Route path="/czev/new" render={props => (<CzevNewStar {...props} entities={{...this.state}}/>)}/>
                    <Route path="/czev/:id/edit" render={props => (<FormCzevStarEdit {...props} entities={{...this.state}}/>)}/>
                    <Route path="/czev/:id" render={props => (<CzevStarDetail {...props} entities={{...this.state}}/>)}/>
                    <Route path="/czev" render={props => (<CzevCatalogue {...props} entities={{...this.state}}/>)}/>
                </Switch>
            </Layout.Content>
        )
    }
};

export class CzevCatalogue extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [], loading: true, pagination: {
                size: 'small',
                pageSizeOptions: ['10', '20', '50'],
                showSizeChanger: true,
                showQuickJumper: true
            },
            downloadLoading: false,
            columns: [
                {
                    title: 'Id',
                    dataIndex: 'czevId',
                    sorter: true,
                    render: czevId => (
                        <span style={{color: "#1890ff"}}>{czevId}</span>
                    ),
                    onCell: record => {
                        return {
                            onClick: e => {
                                this.props.history.push(`/czev/${record.czevId}`)
                            },
                            className: "column-czevid"
                        }
                    }
                },
                {
                    title: 'Constellation',
                    dataIndex: 'constellation.abbreviation',
                    sorter: true
                },
                {
                    title: 'Type',
                    dataIndex: 'type',
                    sorter: true
                },
                {
                    title: 'RA (J2000)',
                    dataIndex: 'coordinates.raString',
                },
                {
                    title: 'DEC (J2000)',
                    dataIndex: 'coordinates.decString',
                },
                {
                    title: 'Epoch',
                    dataIndex: 'm0',
                    sorter: true
                },
                {
                    title: 'Period',
                    dataIndex: 'period',
                    sorter: true
                },
                {
                    title: 'Discoverer',
                    dataIndex: 'discoverers',
                    render: discoverers => (
                        <span>
            {
                discoverers.map(d => {
                        return (<span key={d.abbreviation} title={`${d.firstName} ${d.lastName}`}>{d.abbreviation} </span>)
                    }
                )
            }
            </span>
                    )
                }
            ]
        };
    }

    loadPage(page, size, sorter) {
        this.setState({...this.state, loading: true});
        let params = {
            page: page,
            size: size,
        };
        if (sorter && sorter.field && sorter.order) {
            params["sort"] = sorterToParam(sorter)
        }
        axios.get(BASE_URL + "/czev/stars", {
            params: params
        }).then(result => this.setState({
            ...this.state, data: result.data.content, loading: false,
            pagination: {
                ...this.state.pagination,
                total: result.data.totalElements,
                current: result.data.number + 1,
                pageSize: result.data.size,
            }
        }));
    }

    handleTableChange = (pagination, filters, sorter) => {
        this.loadPage(pagination.current - 1, pagination.pageSize, sorter)
    };

    componentDidMount() {
        this.loadPage(0, 10)
    }

    handleDownload = () => {
        this.setState({...this.state, downloadLoading: true});
        axios.get(BASE_URL + "/czev/export/stars", {
            params: {
                format: "csv"
            },
            // responseType: 'blob'
        }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data.content]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', response.data.filename);
            document.body.appendChild(link);
            link.click();
            this.setState({...this.state, downloadLoading: false});
        });
    };

    render() {
        return (
            <Card>
                <Table size="small" rowKey="czevId" columns={this.state.columns} dataSource={this.state.data}
                       loading={this.state.loading} pagination={this.state.pagination}
                       onChange={this.handleTableChange}/>
                <Button loading={this.state.downloadLoading}
                        style={{position: "absolute", bottom: "24px", marginBottom: 16}} onClick={this.handleDownload}
                        type="ghost" icon="download" size="small">Download</Button>
            </Card>
        )
    }
}

export class CzevStarDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: null,
            error: null
        }
    }

    async componentDidMount() {
        this.setState({...this.state, loading: true});
        try {
            const result = await axios.get(BASE_URL + "/czev/stars/" + this.props.match.params.id);
            this.setState({...this.state, data: result.data, loading: false});
        } catch (error) {
            if (error.response) {
                this.setState({...this.state, loading: false, data: null, error: error.response})
            }
        }
    }

    render() {
        const data = this.state.data;
        let body = (<span/>);
        if (data) {
            body = (<Row gutter={8}>
                <Col span={24} xl={{span: 8}} md={{span: 12}}>
                    <h3>CzeV {data.czevId} {data.constellation.abbreviation} <Link to={`/czev/${data.czevId}/edit`}><Icon title="Edit" className="clickable-icon" type="edit" /></Link></h3>
                    <div>{data.crossIdentifications.join(" / ")}</div>
                    <div><b>Type: </b>{data.type}</div>
                    <div><b>J: </b>{data.jmagnitude}</div>
                    <div><b>V: </b>{data.vmagnitude}</div>
                    <div><b>K: </b>{data.kmagnitude}</div>
                    <div><b>Amplitude: </b>{data.amplitude}</div>
                    <div><b>Filter band: </b>{data.filterBand ? data.filterBand.name : ''}</div>
                    <div><b>Epoch: </b>{data.m0}</div>
                    <div><b>Period: </b>{data.period}</div>
                    <div><b>Year of discovery: </b>{data.year}</div>
                    <div><b>Discoverer: </b>{data.discoverers.map(d => `${d.firstName} ${d.lastName}`).join(", ")}</div>
                    <div><b>Note: </b>{data.publicNote}</div>
                </Col>
                <Col span={24} xl={{span: 8}} md={{span: 12}}>
                    <div style={{textAlign: 'center'}}>
                        <span><span>RA: </span><CoordinateWrapper value={data.coordinates.raString}/></span>&nbsp;
                        <span><span>DEC: </span><CoordinateWrapper value={data.coordinates.decString}/></span></div>
                    <StarMap coordinates={data.coordinates}/>
                </Col>
            </Row>)
        } else if (this.state.error) {
            if (this.state.error.status === 404) {
                body = (<div>Not found</div>)
            } else {
                body = (<div>Error occurred</div>)
            }
        }
        return (
            <Card>
                <Spin spinning={this.state.loading}>
                    {body}
                </Spin>
            </Card>
        )
    }
}

export class CzevNewStar extends Component {
    render() {
        return (
            <div className="card-container">
                <Tabs type="card">
                    <Tabs.TabPane tab="Single" key={1}>
                        <FormStarDraftSingleNewStar entities={this.props.entities}/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Import multiple" key={2}>
                        <StarDraftCsvImportWrapper/>
                    </Tabs.TabPane>
                </Tabs>
            </div>
        )
    }
}

const FormStarDraftSingleNewStar = Form.create({})(StarDraftSingleNewStar);

export class CzevStarEdit extends Component {
    render() {
        return (
            <CdsCallsHolder>
                <CzevStarEditComponent {...this.props}/>
            </CdsCallsHolder>
        )
    }
}

const FormCzevStarEdit = Form.create()(CzevStarEdit);

class CzevStarEditComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            originalStar: null,
            starLoading: false,

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
                    coordinatesRa: star.coordinates.ra,
                    coordinatesDec: star.coordinates.dec,
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
                        const body = {
                            id: component.props.match.params.id,
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
                            year: values.year,
                            jmagnitude: values.jmagnitude,
                            vmagnitude: values.vmagnitude,
                            kmagnitude: values.kmagnitude
                        };
                        return axios.put(BASE_URL + "/czev/stars/" + component.props.match.params.id, body)
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
                <Redirect to={"/czev/stars/" + this.props.match.params.id}/>
            )
        }
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 18},
            },
        };

        const {getFieldDecorator} = this.props.form;

        return (
            <Spin spinning={this.state.starLoading}>
                <Card>
                    <Row gutter={8}>
                        <Col span={24} sm={{span: 16}}>
                            <Form onSubmit={this.handleSubmit}>
                                <StarDraftSingleStarFormItems
                                    form={this.props.form}

                                    onCoordsBlur={this.handleCoordsBlur}
                                    onCrossIdBlur={this.handleCrossIdBlur}
                                    onCrossIdSearch={this.handleCrossIdSearch}

                                    entities={this.props.entities}
                                />
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

// table - filters
// show logs of star changes
