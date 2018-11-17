import {Component} from "react";
import React from "react";

import {Card, Layout, Menu, Table} from 'antd';
import {BASE_URL} from "../../api-endpoint";
import axios from "axios";

const {Header, Content, Footer, Sider} = Layout;

export default class Czev extends Component {
    render() {
        return (
            <Content style={{margin: "24px 24px 0"}}>
                <Card style={{width: "100%"}}>
                    <CzevCatalogue></CzevCatalogue>
                </Card>
            </Content>
        )
    }
}

const columns = [
    {
        title: 'Id',
        dataIndex: 'czevId',
    },
    {
        title: 'Constellation',
        dataIndex: 'constellation.name',
    },
    {
        title: 'Type',
        dataIndex: 'type',
    },
    {
        title: 'RA (J2000)',
        dataIndex: 'coordinates.ra',
    },
    {
        title: 'DEC (J2000)',
        dataIndex: 'coordinates.dec',
    },
    {
        title: 'Epoch',
        dataIndex: 'm0',
    },
    {
        title: 'Period',
        dataIndex: 'period',
    },
    {
        title: 'Discoverer',
        dataIndex: 'discoverers',
        render: discoverers => (
            discoverers.map(d => d.abbreviation).join(', ')
        )
    }
];

export class CzevCatalogue extends Component {
    constructor(props) {
        super(props);
        this.state = {data: [], loading: true, pagination: {}}
    }

    loadPage(page) {
        this.setState({...this.state, loading: true});
        axios.get(BASE_URL + "/czev/stars", {
            params: {
                page: page,
                size: 10
            }
        }).then(value => this.setState({
            ...this.state, data: value.data.content, loading: false,
            pagination: {
                total: value.data.totalElements,
                current: value.data.number + 1,
                size: 'small',
                pageSize: value.data.size,
            }
        }));
    }

    handleTableChange = (pagination, filters, sorter) => {
        console.log(pagination);
        this.loadPage(pagination.current - 1)
    };

    componentDidMount() {
        this.loadPage(0)
    }

    render() {
        return (
            <Table size="small" rowKey="czevId" columns={columns} dataSource={this.state.data}
                   loading={this.state.loading} pagination={this.state.pagination} onChange={this.handleTableChange}/>
            // <CzevCatalogueTable loading={this.state.loading} data={this.state.data} pagination={this.state.pagination}/>
        )
    }
}

export class CzevCatalogueTable extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <Table size="small" rowKey="czevId" columns={columns} dataSource={this.props.data}
                   loading={this.props.loading} pagination={this.props.pagination}/>
        )
    }
}
