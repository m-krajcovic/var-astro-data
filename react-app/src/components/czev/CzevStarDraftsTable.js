import React, {Component} from "react";
import {Table} from "antd";
import {IconDeletePopconfirm} from "../common/DeletePopconfirm";

export class CzevStarDraftsTable extends Component {
    static columns = [
        {
            title: 'Cross id',
            dataIndex: 'crossIdentifications',
            render: crossIds => crossIds.length === 0 ? (<i>No cross-id</i>) :
                <span title={crossIds.join(", ")}>{crossIds[0]}</span>,
        },
        {
            title: 'Last change',
            dataIndex: 'lastChange',
            sorter: (a, b) => a.lastChange.localeCompare(b.lastChange)
        },
        {
            title: 'Constellation',
            dataIndex: 'constellation.abbreviation',
            sorter: (a, b) => a.constellation.name.localeCompare(b.constellation.name)
        },
        {
            title: 'Type',
            dataIndex: 'type',
            sorter: (a, b) => a.type.localeCompare(b.type)
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
            sorter: (a, b) => a.m0 - b.m0
        },
        {
            title: 'Period',
            dataIndex: 'period',
            sorter: (a, b) => a.period - b.period
        },
        {
            title: 'Discoverer',
            dataIndex: 'discoverers',
            render: discoverers => (
                <span>
                        {discoverers.map(d => {
                                return (<span key={d.abbreviation}
                                              title={`${d.firstName} ${d.lastName}`}>{d.abbreviation} </span>)
                            }
                        )}
                        </span>
            )
        },
    ];

    static defaultProps = {
        data: [],
        loading: false,
        showCreatedBy: false,
        onRowClick: () => {
        },
        onRemoveClick: () => {
        },
        showRemove: true,
    };

    constructor(props) {
        super(props);
        this.state = {
            removeConfirmVisible: false
        }
    }

    render() {
        const columns = [...CzevStarDraftsTable.columns];
        if (this.props.showCreatedBy) {
            columns.push(
                {
                    title: 'Created by',
                    dataIndex: 'createdBy.name',
                    sorter: (a, b) => a.createdBy.name.localeCompare(b.createdBy.name)
                });
        }
        if (this.props.showRemove) {
            columns.push(
                {
                    title: '',
                    dataIndex: 'id',
                    key: 'operation',
                    onCell: record => {
                        return {
                            onClick: e => e.stopPropagation()
                        };
                    },
                    render: id => (<IconDeletePopconfirm onConfirm={() => this.props.onRemoveClick(id)}/>)
                }
            )
        }
        return (
            <Table
                onRow={(record) => {
                    return {
                        onClick: () => {
                            this.props.onRowClick(record);
                        },
                        style: {cursor: "pointer"}
                    }
                }}
                size="small" rowKey="id" columns={columns} dataSource={this.props.data}
                loading={this.props.loading}/>
        )
    }
}
