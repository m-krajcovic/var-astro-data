import React, {Component} from "react";
import {sorterToParam} from "../common/tableHelper";
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";
import {CoordinateWrapper} from "../common/CoordinateWrapper";
import {Button, Card, Spin, Table} from "antd";
import {CzevCatalogueAdvancedSearch} from "./CzevCatalogueAdvancedSearch";

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
                showTotal: total => `Total ${total} star${total !== 1 ? 's' : ''}`
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
                        return (<span key={d.abbreviation}
                                      title={`${d.firstName} ${d.lastName}`}>{d.lastName}{discoverers.length !== i + 1 ? ", " : ""}</span>)
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
                    <CzevCatalogueAdvancedSearch entities={this.props.entities} onSubmit={this.handleSearch}/>
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
