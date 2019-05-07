import React, {Component} from "react";
import axios from "axios";
import {BASE_URL} from "../../../api-endpoint";
import {Link, NavLink} from "react-router-dom";
import {Card, Spin, Table, Layout, Button, notification, Form} from "antd";
import {AnchorButton} from "../../common/AnchorButton";
import {EditDeleteAnchorButtons} from "../../common/EditDeleteAnchorButtons";
import {PromiseFormModal} from "../../common/PromiseFormModal";
import {IdNameSelectFormItem, InputFormItem, NumberFormItem} from "../../common/FormItems";
import {MinimaPublicationsConsumer, MinimaPublicationProvider} from "../../common/MinimaPublicationsContext";

export class MinimaPublicationsListPage extends Component {

    constructor(props) {
        super(props);
        this.state = {addModalVisible: false, selectedMinima: null};
    }

    refresh = (reload) => {
        this.handleCancel();
        reload();
    };

    handleCancel = () => {
        this.setState({...this.state, selectedMinima: null, addModalVisible: false});
    };

    handleAdd = () => {
        this.setState({...this.state, addModalVisible: true});
    };

    handleEdit = (row) => {
        this.setState({...this.state, selectedMinima: row});
    };

    handleDelete = (row, reload) => {
        axios.delete(BASE_URL + "/ocgate/publications/" + row.id)
            .then(result => {
                notification.success({
                    message: "Deleted"
                });
                reload();
            })
            .catch(reason => {

            });
    };

    render() {
        return (
            <Layout.Content style={{margin: "24px 24px 0"}}>
                <MinimaPublicationsConsumer>
                    {({publications, loading, reload}) => (
                        <Card>
                            <PromiseFormModal
                                visible={this.state.addModalVisible}
                                promise={axios.post}
                                title="Add new minima publication"
                                url={BASE_URL + "/ocgate/publications"}
                                onCancel={this.handleCancel}
                                onOk={() => this.refresh(reload)}
                                successMessage="New minima publication added"
                                render={form => (
                                    <Form layout="vertical">
                                        <InputFormItem form={form} label="Name" field="name" required={true}/>
                                        <NumberFormItem form={form} label="Year" field="year"/>
                                        <InputFormItem form={form} label="Volume" field="volume"/>
                                        <InputFormItem form={form} label="Page" field="page"/>
                                        <InputFormItem form={form} label="Link" field="link"/>
                                    </Form>
                                )}
                            />
                            {this.state.selectedMinima != null && (
                                <PromiseFormModal
                                    visible={true}
                                    promise={axios.put}
                                    title="Edit minima publication"
                                    url={() => BASE_URL + "/ocgate/publications/" + this.state.selectedMinima.id}
                                    onCancel={this.handleCancel}
                                    onOk={() => this.refresh(reload)}
                                    successMessage="Minima publication edited"
                                    render={form => (
                                        <Form layout="vertical">
                                            <InputFormItem initialValue={this.state.selectedMinima.name} form={form}
                                                           label="Name" field="name" required={true}/>
                                            <NumberFormItem initialValue={this.state.selectedMinima.year} form={form}
                                                            label="Year" field="year"/>
                                            <InputFormItem initialValue={this.state.selectedMinima.volume} form={form}
                                                           label="Volume" field="volume"/>
                                            <InputFormItem initialValue={this.state.selectedMinima.page} form={form}
                                                           label="Page" field="page"/>
                                            <InputFormItem initialValue={this.state.selectedMinima.link} form={form}
                                                           label="Link" field="link"/>
                                        </Form>
                                    )}
                                />
                            )}
                            <div style={{marginBottom: "0.5rem", textAlign: "right"}}>
                                <Button onClick={this.handleAdd} type="primary">Add new publication</Button>
                            </div>
                            <Table
                                scroll={{x: 800}}
                                dataSource={publications}
                                loading={loading}
                                rowKey="id"
                                size="small"
                            >
                                <Table.Column
                                    title="Name"
                                    dataIndex="name"
                                    width={80}
                                />
                                <Table.Column
                                    title="Year"
                                    dataIndex="year"
                                    width={80}
                                />
                                <Table.Column
                                    title="Volume"
                                    dataIndex="volume"
                                    width={80}
                                />
                                <Table.Column
                                    title="Page"
                                    dataIndex="page"
                                    width={80}
                                />
                                <Table.Column
                                    title="Link"
                                    dataIndex="link"
                                    width={80}
                                />
                                <Table.Column
                                    title="Actions"
                                    key="actions"
                                    width={130}
                                    render={(row) => (
                                        <EditDeleteAnchorButtons onEdit={() => this.handleEdit(row)}
                                                                 onDelete={() => this.handleDelete(row, reload)}/>
                                    )}
                                />
                            </Table>
                        </Card>
                    )}
                </MinimaPublicationsConsumer>
            </Layout.Content>
        );
    }
}

