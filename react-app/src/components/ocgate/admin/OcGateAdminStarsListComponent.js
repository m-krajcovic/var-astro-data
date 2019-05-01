import React, {Component} from "react";
import axios from "axios";
import {BASE_URL} from "../../../api-endpoint";
import {NavLink} from "react-router-dom";
import {Table} from "antd";

export class OcGateAdminStarsListComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {loading: true, data: []};
    }

    componentDidMount() {
        axios.get(BASE_URL + "/ocgate/stars")
            .then(result => {
                this.setState({
                    data: result.data,
                    loading: false
                })
            })
            .catch(reason => {
                console.log(reason);
            })
    }

    render() {
        return (
            <div>
                <Table
                    columns={OcGateAdminStarsListComponent.columns}
                    dataSource={this.state.data}
                    loading={this.state.loading}
                    rowKey="id"
                    size="small"
                >
                    <Table.Column
                        title="Name"
                        dataIndex="name"
                        width={80}
                    />
                    <Table.Column
                        title="Cons"
                        dataIndex="constellation.abbreviation"
                        width={80}
                    />
                    <Table.Column
                        title="RA"
                        dataIndex="coordinates.raString"
                        width={130}
                    />
                    <Table.Column
                        title="DEC"
                        dataIndex="coordinates.decString"
                        width={130}
                    />
                    <Table.Column
                        title="Actions"
                        key="actions"
                        width={130}
                        render={(row) => (
                            <NavLink to={`/admin/ocgate/stars/${row.id}`}>Details</NavLink>
                        )}
                    />
                </Table>
            </div>
        );
    }
}

