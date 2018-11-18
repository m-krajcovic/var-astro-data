import {Component, Fragment} from "react";
import React from "react";

import {Breadcrumb, Card, Col, Layout, Row, Spin, Table} from 'antd';
import {BASE_URL} from "../../api-endpoint";
import axios from "axios";
import {Link, Route, Switch} from "react-router-dom";

const {Content} = Layout;

const breadcrumbNameMap = {
    "/czev": "CzeV Catalogue"
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
                <Breadcrumb style={{marginBottom: 12}}>
                    {breadcrumbs}
                </Breadcrumb>
                <Card style={{width: "100%"}}>
                    <Switch>
                        <Route path="/czev/:id" component={CzevStarDetail}/>
                        <Route path="/czev" component={CzevCatalogue}/>
                    </Switch>
                </Card>
            </Content>
        )
    }
}

const columns = [
    {
        title: 'Id',
        dataIndex: 'czevId',
        sorter: true,
        render: czevId => (
            <Link to={`/czev/${czevId}`}>{czevId}</Link>
        )
    },
    {
        title: 'Constellation',
        dataIndex: 'constellation.name',
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
                showSizeChanger: true
            }
        }
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

    render() {
        return (
            <Table size="small" rowKey="czevId" columns={columns} dataSource={this.state.data}
                   loading={this.state.loading} pagination={this.state.pagination} onChange={this.handleTableChange}/>
            // <CzevCatalogueTable loading={this.state.loading} data={this.state.data} pagination={this.state.pagination}/>
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
                <Col span={24} md={{span: 12}}>
                    <h3>CzeV {data.czevId} {data.constellation.name}</h3>
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
                <Col span={24} md={{span: 12}}>
                    <div style={{textAlign: 'center'}}>
                        <span><b>RA:</b>{data.coordinates.raString}</span>&nbsp;
                        <span><b>DEC: </b>{data.coordinates.decString}</span></div>
                    <img alt="star map" style={{width: "100%"}}
                         src={`http://archive.stsci.edu/cgi-bin/dss_search?v=1&r=${data.coordinates.raString}&d=${data.coordinates.decString}&e=J2000&h=15.0&w=15.0&f=gif&c=none&fov=NONE&v3=`}/>
                </Col>
                {/*<Col span={24} md={{span: 8}}>c</Col>*/}
            </Row>)
        } else if (this.state.error) {
            if (this.state.error.status === 404) {
                body = (<div>Not found</div>)
            } else {
                body = (<div>Error occurred</div>)
            }
        }
        return (
            <Fragment>
                <Spin spinning={this.state.loading}>
                    {body}
                </Spin>
            </Fragment>
        )
    }
}
