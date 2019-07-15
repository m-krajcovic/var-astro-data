import React, {Component, Fragment} from "react";
import axios from "axios";
import {BASE_URL} from "../../../api-endpoint";
import {Link, NavLink} from "react-router-dom";
import {Card, Spin, Table, Layout, Button, notification, Form} from "antd";
import {AnchorButton} from "../../common/AnchorButton";
import {EditDeleteAnchorButtons} from "../../common/EditDeleteAnchorButtons";
import {PromiseFormModal} from "../../common/PromiseFormModal";
import {IdNameSelectFormItem, InputFormItem, MyForm, NumberFormItem} from "../../common/FormItems";
import {MinimaPublicationsConsumer, MinimaPublicationProvider} from "../../common/MinimaPublicationsContext";

class MinimaPublicationVolumeTable extends Component {
    static defaultProps = {
        volumes: [],
        onChange: () => {
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedVolume: null,
            addModalVisible: false
        }
    }

    handleChange = () => {
        this.handleCancel();
        this.props.onChange();
    };

    handleAdd = () => {
        this.setState({...this.state, addModalVisible: true})
    };

    handleEdit = (row) => {
        this.setState({...this.state, selectedVolume: row});
    };

    handleCancel = () => {
        this.setState({...this.state, selectedVolume: null, addModalVisible: false});
    };

    handleDelete = (row) => {
        axios.delete(BASE_URL + "/ocgate/publications/volumes/" + row.id)
            .then(result => {
                notification.success({
                    message: "Deleted"
                });
                this.props.onChange();
            })
            .catch(reason => {

            });
    };

    render() {
        return (
            <Fragment>
                <PromiseFormModal
                    visible={this.state.addModalVisible}
                    promise={axios.post}
                    title="Add new volume"
                    url={BASE_URL + `/ocgate/publications/${this.props.publication.id}/volumes`}
                    onCancel={this.handleCancel}
                    onOk={this.handleChange}
                    successMessage="New volume added"
                    render={form => (
                        <MyForm layout="vertical" form={form}>
                            <InputFormItem label="Name" field="name" required={true}/>
                            <NumberFormItem label="Year" field="year" required={true}/>
                            <InputFormItem label="Link" field="link"/>
                        </MyForm>
                    )}
                />
                {this.state.selectedVolume != null && (
                    <PromiseFormModal
                        visible={true}
                        promise={axios.put}
                        title="Edit volume"
                        url={() => BASE_URL + "/ocgate/publications/volumes/" + this.state.selectedVolume.id}
                        onCancel={this.handleCancel}
                        onOk={this.handleChange}
                        successMessage="Volume edited"
                        render={form => (
                            <MyForm layout="vertical" form={form}>
                                <InputFormItem initialValue={this.state.selectedVolume.name}
                                               label="Name" field="name" required={true}/>
                                <NumberFormItem initialValue={this.state.selectedVolume.year}
                                                label="Year" field="year"/>
                                <InputFormItem initialValue={this.state.selectedVolume.link}
                                               label="Link" field="link"/>
                            </MyForm>
                        )}
                    />
                )}
                <Table
                    dataSource={this.props.publication.volumes}
                    rowKey="id"
                    // size="small"
                    footer={() => (
                        <Button onClick={this.handleAdd} type="primary">Add volume</Button>
                    )}
                    pagination={false}
                >
                    <Table.Column
                        title="Volume"
                        dataIndex="name"
                        width={200}
                    />
                    <Table.Column
                        title="Year"
                        dataIndex="year"
                        width={80}
                    />
                    <Table.Column
                        title="Link"
                        dataIndex="link"
                        width={150}
                    />
                    <Table.Column
                        title="Actions"
                        key="actions"
                        render={(row) => (
                            <EditDeleteAnchorButtons onEdit={() => this.handleEdit(row)}
                                                     onDelete={() => this.handleDelete(row)}/>
                        )}
                    />
                </Table>
            </Fragment>
        );
    }
}

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
                                valuesFix={values => {
                                    if (!values.volumes) {
                                        values.volumes = [];
                                    }
                                    return values
                                }}
                                title="Add new minima publication"
                                url={BASE_URL + "/ocgate/publications"}
                                onCancel={this.handleCancel}
                                onOk={() => this.refresh(reload)}
                                successMessage="New minima publication added"
                                render={form => (
                                    <MyForm layout="vertical" form={form}>
                                        <InputFormItem label="Name" field="name" required={true}/>
                                        <InputFormItem label="Link" field="link"/>
                                    </MyForm>
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
                                        <MyForm layout="vertical" form={form}>
                                            <InputFormItem initialValue={this.state.selectedMinima.name}
                                                           label="Name" field="name" required={true}/>
                                            <InputFormItem initialValue={this.state.selectedMinima.link}
                                                           label="Link" field="link"/>
                                        </MyForm>
                                    )}
                                />
                            )}
                            <div style={{marginBottom: "0.5rem", display: "flex", justifyContent: "space-between"}}>
                                <h2>Minima Publications</h2>
                                <Button onClick={this.handleAdd} type="primary">Add new publication</Button>
                            </div>
                            <Table
                                scroll={{x: 800}}
                                dataSource={publications}
                                loading={loading}
                                rowKey="id"
                                // size="small"
                                expandedRowRender={(record) => (
                                    <MinimaPublicationVolumeTable onChange={() => this.refresh(reload)}
                                                                  publication={record}/>)}
                                expandRowByClick={true}
                            >
                                <Table.Column
                                    title="Name"
                                    dataIndex="name"
                                    width={200}
                                />
                                <Table.Column
                                    title="Link"
                                    dataIndex="link"
                                    width={150}
                                />
                                <Table.Column
                                    title="Actions"
                                    key="actions"
                                    render={(row) => (
                                        <EditDeleteAnchorButtons onEdit={(e) => {
                                            e.stopPropagation();
                                            this.handleEdit(row)
                                        }} onDelete={() => this.handleDelete(row, reload)}/>
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

