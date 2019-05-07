import React, {Component} from "react";
import axios from "axios";
import {BASE_URL} from "../../../api-endpoint";
import {Link, NavLink} from "react-router-dom";
import {Card, Spin, Table, Layout, Button} from "antd";

export class OcGateAdminStarsListPage extends Component {

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
                // TODO
            })
    }

    render() {
        return (
            <Layout.Content style={{margin: "24px 24px 0"}}>
                <Card>
                    <div style={{marginBottom: "0.5rem", textAlign: "right"}}>
                        <Button type="primary"><Link
                            to="/admin/ocgate/stars/new">Add new star</Link></Button>
                    </div>
                    <Table
                        scroll={{x: 800}}
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
                </Card>
            </Layout.Content>
        );
    }
}

