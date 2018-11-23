import React, {Component} from "react";
import {Table} from "antd";

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
        }
    };

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
        return (
            <Table
                onRow={(record) => {
                    return {
                        onClick: () => this.props.onRowClick(record),
                        style: {cursor: "pointer"}
                    }
                }}
                size="small" rowKey="id" columns={columns} dataSource={this.props.data}
                loading={this.props.loading}/>
        )
    }
}
