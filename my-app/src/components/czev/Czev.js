import {Component, Fragment} from "react";
import React from "react";

import {
    Breadcrumb,
    Card,
    Col,
    Layout,
    Row,
    Spin,
    Table,
    Popover,
    Button,
    Form,
    Input,
    InputNumber,
    Select,
    Icon,
    AutoComplete, Checkbox, Alert, Collapse, Tabs, List, Tooltip, Modal
} from 'antd';
import {BASE_URL} from "../../api-endpoint";
import axios from "axios";
import {Link, Route, Switch} from "react-router-dom";

import "./Czev.css";
import AnimateHeight from "react-animate-height";

const {Content} = Layout;
const Option = Select.Option;


const breadcrumbNameMap = {
    "/czev": "CzeV Catalogue",
    "/czev/new": "New variable star"
};

export default class Czev extends Component {
    render() {
        const pathSnippets = this.props.location.pathname.split("/").filter(i => i);
        const breadcrumbs = pathSnippets.map((snippet, index) => {
            const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
            return (
                <Breadcrumb.Item key={url}>
                    <Link to={url}>
                        {breadcrumbNameMap[url] ? breadcrumbNameMap[url] : snippet}
                    </Link>
                </Breadcrumb.Item>
            )
        });
        return (
            <Content style={{margin: "24px 24px 0"}}>
                <Row>
                    <Col span={12}>
                        <Breadcrumb style={{marginBottom: 12}}>
                            {breadcrumbs}
                        </Breadcrumb>
                    </Col>
                    {this.props.location.pathname !== "/czev/new" && (<Col span={12} style={{textAlign: "right"}}>
                        <Button type="primary" size="small"><Link to="/czev/new">Submit new variable
                            star</Link></Button>
                    </Col>)}
                </Row>
                <Switch>
                    <Route path="/czev/new" component={WrappedCzevNewStar}/>
                    <Route path="/czev/:id" component={CzevStarDetail}/>
                    <Route path="/czev" component={CzevCatalogue}/>
                </Switch>
            </Content>
        )
    }
}

const sortOrder = {
    "ascend": "asc",
    "descend": "desc"
};

const sorterToParam = (sorter) => {
    return `${sorter.field},${sortOrder[sorter.order]}`
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
            downloadLoading: false
        };

        this.columns = [
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
        ];
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
            console.log(response);
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
                <Table size="small" rowKey="czevId" columns={this.columns} dataSource={this.state.data}
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
            const result = await axios.get(BASE_URL + "/czev/stars/" + this.props.match.params.id)
            this.setState({...this.state, data: result.data, loading: false});
        } catch (error) {
            if (error.response) {
                console.log(error.response);
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
                    <h3>CzeV {data.czevId} {data.constellation.abbreviation}</h3>
                    <div>{data.crossIdentifications.join(" / ")}</div>
                    <div><b>Type: </b>{data.type}</div>
                    <div><b>J: </b>{data.jmagnitude}</div>
                    <div><b>V: </b>{data.vmagnitude}</div>
                    <div><b>J-K: </b>{data.jkMagnitude}</div>
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
                    <img alt="star map" style={{width: "100%"}}
                         src={`http://archive.stsci.edu/cgi-bin/dss_search?v=1&r=${data.coordinates.raString}&d=${data.coordinates.decString}&e=J2000&h=15.0&w=15.0&f=gif&c=none&fov=NONE&v3=`}/>
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

function CoordinateWrapper(props) {
    return (
        <Copyable value={props.value} style={{fontFamily: "monospace", fontSize: "1rem"}}/>
    )
}

class Copyable extends Component {
    constructor(props) {
        super(props);
        this.state = {popoverVisible: false};
    }

    handleOnClick = () => {
        const el = document.createElement('textarea');
        el.value = this.props.value;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        this.setState({popoverVisible: true});
        setTimeout(() => {
            this.setState({popoverVisible: false});
        }, 600)
    };

    render() {
        const style = {
            cursor: "pointer"
        };
        if (this.props.style) {
            Object.assign(style, this.props.style);
        }

        return (
            <Popover trigger="click" content="Copied" visible={this.state.popoverVisible}>
                <span className="copyable" onClick={this.handleOnClick} style={style}>{this.props.value}</span>
            </Popover>
        )
    }
}

/*
        val constellation: ConstellationModel,
        val type: String,
        val discoverers: List<StarObserverModel>,
        val amplitude: Double?,
        val filterBand: FilterBandModel?,
        val crossIdentifications: Set<String>,
        val coordinates: CosmicCoordinatesModel,
        val privateNote: String,
        val publicNote: String,
        val m0: BigDecimal?,
        val period: BigDecimal?,
        val year: Int
*/
export class CzevNewStar extends Component {
    constructor(props) {
        super(props);
        this.defaultTypes = ["EB", "EW", "EA", "DSCT", "HADS", "RRAB", "RRC", "ELL", "UV", "M", "SR", "CV", "ACV", "DCEP"];
        this.state = {
            constellations: [],
            observers: [],
            types: [],
            filterbands: [],
            constellationsLoading: false,
            filterbandsLoading: false,
            typesLoading: false,
            observersLoading: false,

            typeOptions: this.defaultTypes,
            typeUncertain: false,
            typeValid: true,

            coordsInfoParams: {},
            coordsInfoLoading: false,
            coordsInfoResult: null,

            nameInfoParams: {},
            nameInfoLoading: false,
            nameInfoResult: null
        };
        this.crossIdRegexp = /((UCAC4\s\d{3}-\d{6})|(USNO-B[12]\.0\s\d{4}-\d{7}))/;
        // this.coordinatesRegexp = /((\\d*(\\.\\d+)?)\\s+([+\\-]?\\d*(\\.\\d+)?))|((\\d{1,2})[\\s:](\\d{1,2})[\\s:](\\d{0,2}(\\.\\d+)?)\\s([+\\-]?\\d{1,2})[\\s:](\\d{1,2})[\\s:](\\d{0,2}(\\.\\d+)?))$/;
        this.coordinatesRaRegexp = /^((\d*(\.\d+)?)|((\d{1,2})[\s:](\d{1,2})[\s:](\d{0,2}(\.\d+)?)))$/;
        this.coordinatesDecRegexp = /^(([+-]?\d*(\.\d+)?)|(([+-]?\d{1,2})[\s:](\d{1,2})[\s:](\d{0,2}(\.\d+)?)))$/;
    }

    componentDidMount() {
        this.setState({
            ...this.state,
            constellationsLoading: true,
            observersLoading: true,
            filterbandsLoading: true,
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
        axios.get(BASE_URL + "/czev/filterbands")
            .then(result => {
                this.setState({...this.state, filterbandsLoading: false, filterbands: result.data});
            });
        axios.get(BASE_URL + "/czev/observers")
            .then(result => {
                this.setState({...this.state, observersLoading: false, observers: result.data});
            });
    }

    removeCrossId = (k) => {
        const {form} = this.props;
        // can use data-binding to get
        const crossidKeys = form.getFieldValue('crossidKeys');
        // We need at least one passenger
        if (crossidKeys.length === 1) {
            return;
        }

        // can use data-binding to set
        form.setFieldsValue({
            crossidKeys: crossidKeys.filter(key => key !== k),
        });
    };

    addCrossId = () => {
        const {form} = this.props;
        // can use data-binding to get
        const crossidKeys = form.getFieldValue('crossidKeys');
        const nextKeys = crossidKeys.concat(crossidKeys[crossidKeys.length - 1] + 1);
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            crossidKeys: nextKeys,
        });
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                Modal.confirm({
                    title: 'Are you sure you want to submit this form?',
                    content: '',
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk() {
                        console.log('OK');
                        console.log(values);
                    },
                    onCancel() {
                        console.log('Cancel');
                    },
                });
            }
        });
    };

    handleTypeSearch = (value) => {
        if (!value) {
            this.setState({...this.state, typeOptions: this.defaultTypes})
        } else {
            let filtered = this.defaultTypes.filter(t => t.toLowerCase().includes(value.toLowerCase()));
            if (filtered.length === 1) {
                filtered = filtered.concat([
                    `${filtered[0]}:`,
                    `${filtered[0]}/`,
                    `${filtered[0]}|`,
                    `${filtered[0]}+`,
                ])
            }
            this.setState({...this.state, typeOptions: filtered});
        }
    };

    handleTypeUncertainChange = (e) => {
        const uncertain = e.target.checked;
        this.setState({...this.state, typeUncertain: uncertain});
        const {form} = this.props;
        let type = form.getFieldValue('type');
        if (!type) {
            type = ""
        }
        if ((uncertain && type.endsWith(':')) || (!uncertain && !type.endsWith(':'))) {
        } else {
            if (uncertain) {
                form.setFieldsValue({
                    type: type + ":"
                });
            } else {
                form.setFieldsValue({
                    type: type.substring(0, type.length - 1)
                });
            }
        }
    };

    handleTypeChange = (value) => {
        const uncertain = this.state.typeUncertain;
        if (!value) {
            value = "";
        } else {
            let typeValid = true;
            const certainType = value[value.length - 1] === ':' ? value.substring(0, value.length - 1) : value;
            const types = certainType.split(/[|+/]/);
            types.forEach(type => {
                if (!this.state.types.has(type)) {
                    typeValid = false;
                }
            });
            this.setState({...this.state, typeValid: typeValid});
        }
        if (uncertain && !value.endsWith(':')) {
            this.setState({...this.state, typeUncertain: false});
        } else if (!uncertain && value.endsWith(':')) {
            this.setState({...this.state, typeUncertain: true});
        }
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
        validateFields(["crossids[0]"], (err, values) => {
            if (!err && values && values.crossids[0]) {
                if (this.state.nameInfoParams !== values.crossids[0]) {
                    this.setState({...this.state, nameInfoParams: values.crossids[0], nameInfoLoading: true});
                    axios.get(BASE_URL + "/czev/cds/all", {
                        params: {
                            name: values.crossids[0],
                        }
                    }).then(result => {
                        if (this.state.nameInfoParams === values.crossids[0]) {
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

    validateDecRange = (rule, value, callback) => {
        callback();
    };

    validateRaRange = (rule, value, callback) => {
        callback();
    };

    handleUcacCopy = (model) => {
        const {form} = this.props;
        form.setFieldsValue({
            coordinatesRa: model.coordinates.ra,
            coordinatesDec: model.coordinates.dec,
            "crossids[0]": `UCAC4 ${model.identifier}`,
        });
        this.handleCoordsBlur();
        this.handleCrossIdBlur();
    };


    render() {
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
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: {span: 24, offset: 0},
                sm: {span: 18, offset: 6},
            },
        };
        const currentYear = new Date().getFullYear();
        const {getFieldDecorator, getFieldValue} = this.props.form;


        getFieldDecorator('crossidKeys', {initialValue: [0]});
        const crossids = getFieldValue('crossidKeys');

        const crossIdFormItems = crossids.map((k, index) => {
            return (
                <Form.Item
                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                    label={index === 0 ? 'Cross identifications' : ''}
                    required={true}
                    key={k}
                >
                    {getFieldDecorator(`crossids[${k}]`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [{
                            required: true,
                            whitespace: true,
                            message: k === 0 ? "Please input valid UCAC4/USNO-B identification" : "Please input valid cross id or delete this field.",
                        }].concat(k === 0 ? {
                            pattern: this.crossIdRegexp, message: "Please input valid UCAC4/USNO-B identification"
                        } : []),
                    })(
                        <Input onBlur={() => {
                            if (k === 0) {
                                this.handleCrossIdBlur()
                            }
                        }} placeholder="Cross id" style={{width: "90%", marginRight: 8}}
                               suffix={(
                                   <Tooltip title="Search in catalogues"><Icon type="search" className="clickable-icon"
                                                                               onClick={() => this.handleCrossIdSearch(getFieldValue(`crossids[${k}]`))}/></Tooltip>)}/>
                    )}
                    {k > 0 ? (
                        <Icon
                            className="dynamic-delete-button"
                            type="minus-circle-o"
                            disabled={crossids.length === 1}
                            onClick={() => this.removeCrossId(k)}
                        />
                    ) : null}
                </Form.Item>
            )
        });

        return (
            <div className="card-container">
                <Tabs type="card">
                    <Tabs.TabPane tab="Single" key={1}>
                        <Row gutter={8}>
                            <Col span={24} sm={{span: 16}}>
                                <Form onSubmit={this.handleSubmit}>
                                    <Form.Item {...formItemLayout} label="Coordinates (J2000)" required={true}>
                                        <Col span={12}>
                                            <Form.Item>
                                                {getFieldDecorator('coordinatesRa', {
                                                    rules: [{
                                                        pattern: this.coordinatesRaRegexp,
                                                        message: 'The input is not valid right ascension!',
                                                    }, {
                                                        required: true, message: 'Please input the right ascension!',
                                                    }, {
                                                        validator: this.validateRaRange
                                                    }],
                                                })(
                                                    <Input placeholder="Right ascension" onBlur={this.handleCoordsBlur}
                                                           style={{
                                                               borderTopRightRadius: 0,
                                                               borderBottomRightRadius: 0
                                                           }}/>
                                                )}
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item>
                                                {getFieldDecorator('coordinatesDec', {
                                                    rules: [{
                                                        pattern: this.coordinatesDecRegexp,
                                                        message: 'The input is not valid declination!',
                                                    }, {
                                                        required: true, message: 'Please input the declination!',
                                                    }, {
                                                        validator: this.validateDecRange
                                                    }],
                                                })(
                                                    <Input placeholder="Declination" onBlur={this.handleCoordsBlur}
                                                           style={{borderBottomLeftRadius: 0, borderTopLeftRadius: 0}}/>
                                                )}
                                            </Form.Item>
                                        </Col>
                                    </Form.Item>
                                    {crossIdFormItems}
                                    <Form.Item {...formItemLayoutWithOutLabel}>
                                        <Button type="dashed" onClick={this.addCrossId} style={{width: "90%"}}>
                                            <Icon type="plus"/> Add Cross id
                                        </Button>
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label="Constellation">
                                        <Spin spinning={this.state.constellationsLoading}>
                                            {
                                                getFieldDecorator('constellation', {
                                                    rules: [
                                                        {required: true, message: "Please choose a constellation"}
                                                    ]
                                                })(
                                                    <Select
                                                        showSearch
                                                        placeholder="Select a constellation"
                                                        optionFilterProp="children"
                                                    >
                                                        {this.state.constellations.map(cons => {
                                                            return (
                                                                <Option
                                                                    key={cons.id}>{cons.abbreviation} ({cons.name})</Option>
                                                            )
                                                        })}
                                                    </Select>
                                                )
                                            }
                                        </Spin>
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label="Discoverers">
                                        <Spin spinning={this.state.observersLoading}>
                                            {
                                                getFieldDecorator('discoverers', {
                                                    rules: [
                                                        {
                                                            required: true,
                                                            type: "array",
                                                            message: "Choose at least one discoverer"
                                                        }
                                                    ]
                                                })(
                                                    <Select
                                                        showSearch
                                                        mode="multiple"
                                                        placeholder="Select discoverers"
                                                        optionFilterProp="children"
                                                    >
                                                        {this.state.observers.map(obs => {
                                                            return (
                                                                <Option
                                                                    key={obs.id}>{obs.firstName} {obs.lastName}</Option>
                                                            )
                                                        })}
                                                    </Select>
                                                )
                                            }
                                        </Spin>
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label="Year">
                                        {getFieldDecorator('year', {
                                            rules: [{required: true, message: "Year of discovery is required"}],
                                            initialValue: currentYear
                                        })(
                                            <InputNumber max={currentYear}/>
                                        )}
                                    </Form.Item>
                                    <Form.Item style={{marginBottom: 0}} {...formItemLayout} label="Type"
                                               validateStatus={!this.state.typeValid ? "warning" : ""}
                                               help={!this.state.typeValid ? "This is not a valid VSX variable star type, but you can still submit it" : ""}
                                               hasFeedback>
                                        {getFieldDecorator('type', {})(
                                            <AutoComplete
                                                onSearch={this.handleTypeSearch}
                                                dataSource={this.state.typeOptions}
                                                onChange={this.handleTypeChange}>
                                                <Input/>
                                            </AutoComplete>
                                        )}
                                    </Form.Item>
                                    <Form.Item {...formItemLayoutWithOutLabel} extra={(
                                        <span>You can find more information about types <a target="_blank"
                                                                                           rel="noopener noreferrer"
                                                                                           href="https://www.aavso.org/vsx/index.php?view=about.vartypes">here</a></span>)}>
                                        <Checkbox onChange={this.handleTypeUncertainChange}
                                                  checked={this.state.typeUncertain}>Type
                                            uncertain</Checkbox>
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label="Amplitude">
                                        {getFieldDecorator('amplitude', {
                                            rules: [{
                                                type: "number", message: "The input is not valid amplitude"
                                            }],
                                        })(
                                            <InputNumber style={{width: "100%"}}/>
                                        )}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label="Filter band">
                                        <Spin spinning={this.state.filterbandsLoading}>
                                            {getFieldDecorator('filterband', {})(
                                                <Select
                                                    allowClear
                                                    showSearch
                                                    placeholder="Select a filter band"
                                                    optionFilterProp="children"
                                                >
                                                    {this.state.filterbands.map(fb => {
                                                        return (
                                                            <Option key={fb.id}>{fb.name}</Option>
                                                        )
                                                    })}
                                                </Select>
                                            )}
                                        </Spin>
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label="Epoch">
                                        {getFieldDecorator('epoch', {
                                            rules: [{
                                                type: "number", message: "The input is not valid epoch"
                                            }],
                                        })(
                                            <InputNumber
                                                min={2400000}
                                                style={{width: "100%"}}/>
                                        )}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label="Period">
                                        {getFieldDecorator('period', {
                                            rules: [{
                                                type: "number", message: "The input is not valid period"
                                            }],
                                        })(
                                            <InputNumber style={{width: "100%"}}/>
                                        )}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label="Note">
                                        {getFieldDecorator('note', {})(
                                            <Input.TextArea/>
                                        )}
                                    </Form.Item>
                                    <Form.Item {...formItemLayoutWithOutLabel}>
                                        <Button type="primary" htmlType="submit">Submit for approval</Button>
                                    </Form.Item>
                                </Form>
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
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Import multiple" key={2}></Tabs.TabPane>
                </Tabs>
            </div>
        )
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
                                    <a>UCAC4 {item.identifier}</a>
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
                                                       <a>UCAC4 {item.model.identifier}</a>
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

const WrappedCzevNewStar = Form.create()(CzevNewStar);


// new star draft
// - all constellations
// - all observers
// - all bands
// - validate type somehow


// table - filters
// table - export
// insert draft
// insert multiple drafts
// drafts list for user/admin
// draft details for admin - approving / rejecting
// edit drafts
// edit stars
