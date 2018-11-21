import React, {Component} from "react";

import {Breadcrumb, Button, Card, Col, Form, Layout, Row, Spin, Table, Tabs} from 'antd';
import {BASE_URL} from "../../api-endpoint";
import axios from "axios";
import {Link, Route, Switch} from "react-router-dom";

import "./Czev.css";
import {StarDraftSingleNewStar} from "./StarDraftSingleNewStar";
import {CoordinateWrapper} from "./CoordinateWrapper";
import {StarDraftCsvImportWrapper} from "./StarDraftCsvImportWrapper";

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
            <Layout.Content style={{margin: "24px 24px 0"}}>
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
                    <Route path="/czev/new" component={CzevNewStar}/>
                    <Route path="/czev/:id" component={CzevStarDetail}/>
                    <Route path="/czev" component={CzevCatalogue}/>
                </Switch>
            </Layout.Content>
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

export class CzevNewStar extends Component {
    render() {
        return (
            <div className="card-container">
                <Tabs type="card">
                    <Tabs.TabPane tab="Single" key={1}>
                        <FormStarDraftSingleNewStar/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Import multiple" key={2}>
                        <StarDraftCsvImportWrapper/>
                    </Tabs.TabPane>
                </Tabs>
            </div>
        )
    }
}


const FormStarDraftSingleNewStar = Form.create()(StarDraftSingleNewStar);


// table - filters

// drafts list for user/admin
// draft details for admin - approving / rejecting
// edit drafts
// edit stars
