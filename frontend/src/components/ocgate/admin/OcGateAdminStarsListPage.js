import React, {Component} from "react";
import axios from "axios";
import {BASE_URL} from "../../../api-endpoint";
import {Link, NavLink} from "react-router-dom";
import {Card, Spin, Table, Layout, Button} from "antd";
import {CoordinateWrapper} from "../../common/CoordinateWrapper";
import {TableInputFilter} from "../../../App";
import {EntitiesConsumer} from "../../common/EntitiesContext";

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
                    <EntitiesConsumer>
                        {({constellations}) => (
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
                                    filterDropdown={(actions) => (
                                        <TableInputFilter actions={actions}/>
                                    )}
                                    onFilter={(value, record) => record.name.indexOf(value) === 0}
                                    sorter={(a, b) => a.name.localeCompare(b.name)}
                                />
                                <Table.Column
                                    title="Cons"
                                    dataIndex="constellation.abbreviation"
                                    width={80}
                                    filters={constellations.map(c => {
                                        return {
                                            text: `${c.abbreviation} (${c.name})`,
                                            value: c.abbreviation
                                        };
                                    })}
                                    sorter={(a, b) => a.constellation.name.localeCompare(b.constellation.name)}
                                    onFilter={(value, record) => record.constellation.abbreviation === value}
                                />
                                <Table.Column
                                    title="RA"
                                    dataIndex="coordinates.raString"
                                    width={130}
                                    render={ra => (<CoordinateWrapper value={ra}/>)}
                                />
                                <Table.Column
                                    title="DEC"
                                    dataIndex="coordinates.decString"
                                    width={130}
                                    render={dec => (<CoordinateWrapper value={dec}/>)}
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
                        )}
                    </EntitiesConsumer>
                </Card>
            </Layout.Content>
        );
    }
}

