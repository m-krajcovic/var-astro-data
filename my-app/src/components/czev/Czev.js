import React, {Component, Fragment} from "react";

import {
    Button,
    Card,
    Col,
    Form,
    Icon,
    Tag,
    Layout,
    Modal,
    notification,
    Row,
    Spin,
    Table,
    Tabs,
    Input,
    Select, Slider
} from 'antd';
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
import AnimateHeight from "react-animate-height";

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
                    <Route path="/czev/:id/edit"
                           render={props => (<FormCzevStarEdit {...props} entities={{...this.state}}/>)}/>
                    <Route path="/czev/:id"
                           render={props => (<CzevStarDetail {...props} entities={{...this.state}}/>)}/>
                    <Route path="/czev" render={props => (<CzevCatalogue {...props} entities={{...this.state}}/>)}/>
                </Switch>
            </Layout.Content>
        )
    }
};

class ToggleTag extends React.Component {
    state = {checked: false};

    handleChange = (checked) => {
        this.setState({checked});
        this.props.onToggle(checked);
    };

    render() {
        return <Tag.CheckableTag {...this.props} checked={this.state.checked} onChange={this.handleChange}/>;
    }
}

class CzevCatalogueAdvancedSearch extends Component {
    static defaultProps = {
        onSubmit: () => {
        },
        loading: false
    };

    constructor(props) {
        super(props);
        this.state = {
            hidden: true
        };
        this.coordinatesRaRegexp = /^((\d*(\.\d+)?)|((\d{1,2})[\s:](\d{1,2})[\s:](\d{0,2}(\.\d+)?)))$/;
        this.coordinatesDecRegexp = /^(([+-]?\d*(\.\d+)?)|(([+-]?\d{1,2})[\s:](\d{1,2})[\s:](\d{0,2}(\.\d+)?)))$/;
        this.yearsDefaults = [1990, new Date().getFullYear()];
        this.yearMarks = {};
        this.yearMarks[this.yearsDefaults[0]] = "" + this.yearsDefaults[0];
        this.yearMarks[this.yearsDefaults[1]] = "" + this.yearsDefaults[1];
        this.amplitudeDefaults = [0, 2];
        this.amplitudeMarks = {};
        this.amplitudeMarks[this.amplitudeDefaults[0]] = "" + this.amplitudeDefaults[0];
        this.amplitudeMarks[this.amplitudeDefaults[1]] = "" + this.amplitudeDefaults[1];
    }

    handleClear = () => {
        this.props.onSubmit(null);
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const submittedValues = {};
                Object.keys(values).forEach(key => {
                    if (values[key] !== "" && values[key] != null) {
                        if (key === 'amplitude') {
                            if (values[key][0] !== this.amplitudeDefaults[0] || values[key][1] !== this.amplitudeDefaults[1]) {
                                submittedValues['amplitudeFrom'] = values[key][0];
                                submittedValues['amplitudeTo'] = values[key][1];

                            }
                        } else if (key === 'year') {
                            if (values[key][0] !== this.yearsDefaults[0] || values[key][1] !== this.yearsDefaults[1]) {
                                submittedValues['yearFrom'] = values[key][0];
                                submittedValues['yearTo'] = values[key][1];
                            }
                        } else {
                            submittedValues[key] = values[key];
                        }
                    }
                });
                this.props.onSubmit(submittedValues);
            }
        });
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <Spin spinning={this.props.loading}>
                <div style={{marginBottom: 12}}>
                    <ToggleTag onToggle={() => this.setState({...this.state, hidden: !this.state.hidden})}>Advanced
                        search</ToggleTag>
                    <AnimateHeight height={this.state.hidden ? 0 : "auto"}>
                        <Form style={{marginTop: 8}} className="czev-catalogue-search-form"
                              onSubmit={this.handleSubmit}>
                            <Row gutter={24}>
                                <Col span={24} md={{span: 8}}>
                                    <Form.Item label="RA">
                                        {getFieldDecorator('ra', {
                                            rules: [{
                                                pattern: this.coordinatesRaRegexp,
                                                message: 'The input is not valid right ascension!',
                                            }]
                                        })(
                                            <Input/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={24} md={{span: 8}}>
                                    <Form.Item label="DEC">
                                        {getFieldDecorator('dec', {
                                            rules: [{
                                                pattern: this.coordinatesDecRegexp,
                                                message: 'The input is not valid right ascension!',
                                            }]
                                        })(
                                            <Input/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={24} md={{span: 8}}>
                                    <Form.Item label="Radius">
                                        {getFieldDecorator('radius', {
                                            initialValue: 0.01
                                        })(
                                            <Input style={{width: "100%"}} addonAfter="deg"/>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={24} md={{span: 8}}>
                                    <Form.Item label="Constellation">
                                        {getFieldDecorator('constellation', {})(
                                            <Select
                                                showSearch
                                                optionFilterProp="children"
                                            >
                                                {this.props.entities.constellations.map(cons => {
                                                    return (
                                                        <Select.Option
                                                            key={cons.id}>{cons.abbreviation} ({cons.name})</Select.Option>
                                                    )
                                                })}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={24} md={{span: 8}}>
                                    <Form.Item label="Discoverer">
                                        {getFieldDecorator('discoverer', {})(
                                            <Select
                                                showSearch
                                                optionFilterProp="children"
                                            >
                                                {this.props.entities.observers.map(obs => {
                                                    return (
                                                        <Select.Option
                                                            key={obs.id}>{obs.firstName} {obs.lastName}</Select.Option>
                                                    )
                                                })}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={24} md={{span: 8}}>
                                    <Form.Item label="Filter Band">
                                        {getFieldDecorator('filterBand', {})(
                                            <Select
                                                showSearch
                                                optionFilterProp="children"
                                            >
                                                {this.props.entities.filterBands.map(fb => {
                                                    return (
                                                        <Select.Option
                                                            key={fb.id}>{fb.name}</Select.Option>
                                                    )
                                                })}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={24} md={{span: 8}}>
                                    <Form.Item label="Type">
                                        {getFieldDecorator('type', {})(
                                            <Input/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={24} md={{span: 8}}>
                                    <Form.Item label="Amplitude">
                                        {getFieldDecorator('amplitude', {
                                            initialValue: this.amplitudeDefaults
                                        })(
                                            <Slider step={0.01} min={this.amplitudeDefaults[0]} max={this.amplitudeDefaults[1]} range marks={this.amplitudeMarks} />
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={24} md={{span: 8}}>
                                    <Form.Item label="Year">
                                        {getFieldDecorator('year', {
                                            initialValue: [1990, 2018]
                                        })(
                                            <Slider min={this.yearsDefaults[0]} max={this.yearsDefaults[1]} range marks={this.yearMarks} />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24} style={{textAlign: "right"}}>
                                    <Button type="primary" htmlType="submit">Search</Button>
                                    <Button style={{marginLeft: 8}} htmlType="button"
                                            onClick={this.handleClear}>Clear</Button>
                                </Col>
                            </Row>
                        </Form>
                    </AnimateHeight>
                </div>
            </Spin>
        )
    }
}

const WrappedCzevCatalogueAdvancedSearch = Form.create()(CzevCatalogueAdvancedSearch);

export class CzevCatalogue extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [], loading: true, pagination: {
                size: 'small',
                pageSizeOptions: ['10', '20', '50'],
                showSizeChanger: true,
                showQuickJumper: true,
                pageSize: 20,
                showTotal: total => `Total ${total} star${total !== 1 ? 's': ''}`
            },
            downloadLoading: false,
        };
        this.sorter = null;
        this.filters = null;
        this.pageSize = 20;
    }

    loadPage(page, size, sorter, filters) {
        this.setState({...this.state, loading: true});
        let params = {
            page: page,
            size: size,
        };
        if (filters) {
            Object.assign(params, filters);
        }
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
        this.pageSize = pagination.pageSize;
        this.sorter = sorter;
        this.loadPage(pagination.current - 1, pagination.pageSize, sorter, this.filters);
    };

    handleSearch = (values) => {
        this.filters = values;
        this.loadPage(0, this.pageSize, this.sorter, values);
    };

    componentDidMount() {
        this.loadPage(0, 20)
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
        const columns = [
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
                },
                width: 60
            },
            {
                title: 'Cons.',
                dataIndex: 'constellation.abbreviation',
                sorter: true,
                width: 80
            },
            {
                title: 'Type',
                dataIndex: 'type',
                sorter: true,
            },
            {
                title: 'RA (J2000)',
                dataIndex: 'coordinates.raString',
                render: ra => (<CoordinateWrapper value={ra}/>),
                width: 140
            },
            {
                title: 'DEC (J2000)',
                dataIndex: 'coordinates.decString',
                render: dec => (<CoordinateWrapper value={dec}/>),
                width: 140
            },
            {
                title: 'Epoch',
                dataIndex: 'm0',
                sorter: true,
            },
            {
                title: 'Period',
                dataIndex: 'period',
                sorter: true,
            },
            {
                title: 'Discoverer',
                dataIndex: 'discoverers',
                render: discoverers => (
                    <span>
            {
                discoverers.map((d, i) => {
                        return (<span key={d.abbreviation} title={`${d.firstName} ${d.lastName}`}>{d.lastName}{discoverers.length !== i + 1 ? ", " : ""}</span>)
                    }
                )
            }
            </span>
                )
            }
        ];
        return (
            <Spin spinning={this.state.loading}>
                <Card style={{overflow: "hidden"}}>
                    <WrappedCzevCatalogueAdvancedSearch entities={this.props.entities} onSubmit={this.handleSearch}/>
                    <Table size="small" rowKey="czevId" columns={columns} dataSource={this.state.data}
                           scroll={{x: 800}}
                           pagination={this.state.pagination}
                           onChange={this.handleTableChange}/>
                    <Button loading={this.state.downloadLoading}
                            style={{position: "absolute", bottom: "24px", marginBottom: 16}}
                            onClick={this.handleDownload}
                            type="ghost" icon="download" size="small">Download</Button>
                </Card>
            </Spin>
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
                <Col span={24} xxl={{span: 8}} md={{span: 12}}>
                    <h3>CzeV {data.czevId} {data.constellation.abbreviation} <Link
                        to={`/czev/${data.czevId}/edit`}><Icon title="Edit" className="clickable-icon"
                                                               type="edit"/></Link></h3>
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
                <Col span={24} xxl={{span: 8}} md={{span: 12}}>
                    <div style={{textAlign: 'center'}}>
                        <span style={{display: "inline-block"}}><span>RA: </span><CoordinateWrapper size="large"
                                                                  value={data.coordinates.raString}/></span>&nbsp;
                        <span style={{display: "inline-block"}}><span>DEC: </span><CoordinateWrapper size="large" value={data.coordinates.decString}/></span></div>
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

class CzevStarEdit extends Component {
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
                            czevId: component.props.match.params.id,
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
                            kmagnitude: values.kmagnitude,
                            vsxName: ""
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
                <Redirect to={"/czev/" + this.props.match.params.id}/>
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
