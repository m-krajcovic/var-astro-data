import React, {Component, Fragment} from "react";
import axios from "axios";
import {BASE_URL} from "../../../api-endpoint";
import {Table, Layout, Card, Button, Modal, Form, notification} from "antd";
import {AnchorButton} from "../../common/AnchorButton";
import {
    CoordinatesFormItem, IdNameSelectFormItem,
    InputFormItem,
    NumberFormItem,
    TypeFormItem
} from "../../common/FormItems";
import {ObservationsConsumer} from "../ObservationsContext";
import AnimateHeight from "react-animate-height";
import {EditDeleteAnchorButtons} from "../../common/EditDeleteAnchorButtons";
import {Redirect} from "react-router-dom";
import {EntitiesConsumer} from "../../common/EntitiesContext";

const StarBrightnessItem = Form.create()(
    class extends Component {

        static defaultProps = {
            onChange: () => {
            }
        };

        constructor(props) {
            super(props);
            this.state = {minimaShow: false, loading: false};
        }

        handleDelete = () => {
            axios.delete(BASE_URL + "/ocgate/stars/brightness/" + this.props.brightness.id)
                .then(result => {
                    notification.success({
                        message: "Brightness deleted"
                    });
                    this.props.onChange()
                })
                .catch(reason => {
                    // :(
                });
        };

        handleEdit = () => {
            this.setState({...this.state, modalVisible: true});
        };

        handleEditSubmit = () => {
            this.props.form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    this.setState({...this.state, loading: true});
                    axios.put(BASE_URL + "/ocgate/stars/brightness/" + this.props.brightness.id, values)
                        .then(result => {
                            notification.success({
                                message: "Edited star brightness information"
                            });
                            this.setState({...this.state, loading: false});
                            this.props.onChange();
                        })
                        .catch(reason => {
                            // :(
                        });
                }
            });
        };

        render() {
            const spanStyle = {
                display: "inline-block",
                width: 80,
                marginRight: "0.5rem"
            };
            return (
                <div>
                    <b style={{marginRight: "0.5rem"}}>{this.props.brightness.filter.name}:</b>
                    <span style={spanStyle}>MIN S: {this.props.brightness.minS}</span>
                    <span style={spanStyle}>MIN P: {this.props.brightness.minP}</span>
                    <span style={spanStyle}>MAX P: {this.props.brightness.maxP}</span>
                    <EditDeleteAnchorButtons onEdit={this.handleEdit} onDelete={this.handleDelete}/>
                    <Modal
                        visible={this.state.modalVisible}
                        title="Edit star brightness"
                        okText="Submit"
                        destroyOnClose={true}
                        onCancel={() => this.setState({...this.state, modalVisible: false})}
                        onOk={this.handleEditSubmit}
                        confirmLoading={this.state.loading}
                    >
                        <ObservationsConsumer>
                            {({loading, filters}) => (
                                <Form layout="vertical">
                                    <IdNameSelectFormItem loading={loading} form={this.props.form}
                                                          label="Filter"
                                                          field="filterId"
                                                          initialValue={this.props.brightness.filter.id}
                                                          options={filters} required={true}/>
                                    <NumberFormItem form={this.props.form} label="Min S"
                                                    initialValue={this.props.brightness.minS}
                                                    field="minS"/>
                                    <NumberFormItem form={this.props.form} label="Min P"
                                                    initialValue={this.props.brightness.minP}
                                                    field="minP"/>
                                    <NumberFormItem form={this.props.form} label="Max P"
                                                    initialValue={this.props.brightness.maxP}
                                                    field="maxP"/>
                                </Form>
                            )}
                        </ObservationsConsumer>
                    </Modal>
                </div>
            );
        }
    });

const StarBrightnessInfoComponent = Form.create()(
    class extends Component {

        constructor(props) {
            super(props);
            this.state = {
                modalVisible: false,
                loading: false
            }
        }

        handleAdd = () => {
            this.setState({
                modalVisible: true
            })
        };

        handleAddSubmit = () => {
            this.props.form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    values["publicationIds"] = [];
                    this.setState({...this.state, loading: true});
                    axios.post(BASE_URL + `/ocgate/stars/${this.props.star.id}/brightness`, values)
                        .then(result => {
                            notification.success({
                                message: "Added new brightness"
                            });
                            this.setState({...this.state, modalVisible: false, loading: false});
                            this.props.onChange();
                        })
                        .catch(reason => {
                            // :(
                        });
                }
            });
        };

        render() {
            return (
                <div style={{marginTop: "0.5rem"}}>
                    <Modal
                        visible={this.state.modalVisible}
                        title="Add new brightness"
                        okText="Add"
                        destroyOnClose={true}
                        onCancel={() => this.setState({...this.state, modalVisible: false})}
                        onOk={this.handleAddSubmit}
                        confirmLoading={this.state.loading}
                    >
                        <ObservationsConsumer>
                            {({filters, loading}) => (
                                <Form layout="vertical">
                                    <IdNameSelectFormItem loading={loading} form={this.props.form}
                                                          label="Filter"
                                                          field="filterId"
                                                          options={filters} required={true}/>
                                    <NumberFormItem form={this.props.form} label="Min S"
                                                    field="minS"/>
                                    <NumberFormItem form={this.props.form} label="Min P"
                                                    field="minP"/>
                                    <NumberFormItem form={this.props.form} label="Max P"
                                                    field="maxP"/>
                                </Form>
                            )}
                        </ObservationsConsumer>
                    </Modal>
                    <h3>Brightness <Button size="small" type="primary"
                                           onClick={this.handleAdd}>Add</Button></h3>
                    {this.props.brightness.map(b => (
                        <StarBrightnessItem onChange={this.props.onChange} brightness={b} key={b.id}/>))}
                </div>
            )
        }
    });

const StarMinimaInfoTableComponent = Form.create()(
    class extends Component {
        constructor(props) {
            super(props);
            this.state = {loading: false, minima: null};
        }

        componentDidMount() {
            this.props.form.setFields()
        }

        handleDeleteMinima = (minima) => {
            axios.delete(BASE_URL + "/ocgate/minima/" + minima.id)
                .then(result => {
                    notification.success({
                        message: "Minima deleted"
                    });
                    if (this.props.onChange) {
                        this.props.onChange();
                    }
                });
        };

        handleEditMinima = (minima) => {
            this.setState({...this.state, minima: minima});
        };

        handleEditMinimaSubmit = () => {
            this.props.form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    values["publicationIds"] = [];
                    this.setState({...this.state, loading: true});
                    axios.put(BASE_URL + "/ocgate/minima/" + this.state.minima.id, values)
                        .then(result => {
                            notification.success({
                                message: "Edited minima"
                            });
                            this.setState({...this.state, minima: null, loading: false});
                            if (this.props.onChange) {
                                this.props.onChange();
                            }
                        })
                        .catch(reason => {
                            // :(
                        });
                }
            });
        };

        render() {
            return (
                <Fragment>
                    <Modal
                        visible={this.state.minima != null}
                        title="Edit minima"
                        okText="Submit"
                        onCancel={() => this.setState({...this.state, minima: null})}
                        onOk={this.handleEditMinimaSubmit}
                        confirmLoading={this.state.loading}
                        destroyOnClose={true}
                    >
                        <ObservationsConsumer>
                            {({methods, loading}) => (
                                <Form layout="vertical">
                                    <NumberFormItem form={this.props.form} field="julianDate" label="Julian Date"
                                                    required={true} initialValue={this.state.minima.julianDate}/>
                                    <IdNameSelectFormItem
                                        initialValue={this.state.minima.method.id}
                                        form={this.props.form}
                                        label="Method"
                                        field="methodId"
                                        options={methods}
                                        required={true}
                                        loading={loading}
                                    />
                                </Form>
                            )}
                        </ObservationsConsumer>
                    </Modal>
                    <Table
                        dataSource={this.props.minimas}
                        size="small"
                        rowKey="id"
                        scroll={{x: 500}}
                    >
                        <Table.Column
                            title="JD"
                            dataIndex="julianDate"
                        />
                        {
                            this.props.showKind && (
                                <Table.Column
                                    title="Kind"
                                    dataIndex="kind.name"/>
                            )
                        }
                        <Table.Column
                            title="Method"
                            dataIndex="method.name"
                        />
                        <Table.Column
                            title="Actions"
                            key="actions"
                            render={(row) => (
                                <span>
                            <EditDeleteAnchorButtons container={false} onEdit={() => this.handleEditMinima(row)}
                                                     onDelete={() => this.handleDeleteMinima(row)}/>
                        </span>
                            )}
                        />
                    </Table>
                </Fragment>
            )
        }
    });

const StarMinimaInfoComponent = Form.create()(
    class extends Component {

        constructor(props) {
            super(props);
            this.state = {
                visible: false
            }
        }

        handleAddMinima = () => {
            this.setState({
                visible: true
            })
        };

        handleAddMinimaSubmit = () => {
            this.props.form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    values["publicationIds"] = [];
                    this.setState({...this.state, loading: true});
                    axios.post(BASE_URL + "/ocgate/minima", values)
                        .then(result => {
                            notification.success({
                                message: "Added new minima"
                            });
                            this.setState({...this.state, visible: false, loading: false});
                            if (this.props.onChange) {
                                this.props.onChange();
                            }
                        })
                        .catch(reason => {
                            // :(
                        });
                }
            });
        };

        render() {
            // const {getFieldDecorator} = this.props.form;
            return (
                <div style={{marginTop: "0.5rem"}}>
                    <h3>Minimas ({this.props.minimas.length}) <Button size="small" type="primary"
                                                                      onClick={this.handleAddMinima}>Add</Button></h3>
                    <StarMinimaInfoTableComponent onChange={this.props.onChange} showKind={true}
                                                  minimas={this.props.minimas}/>
                    <Modal
                        visible={this.state.visible}
                        title="Add new observed minima"
                        okText="Add"
                        destroyOnClose={true}
                        onCancel={() => this.setState({...this.state, visible: false})}
                        onOk={this.handleAddMinimaSubmit}
                        confirmLoading={this.state.loading}
                    >
                        <ObservationsConsumer>
                            {({methods, loading}) => (
                                <Form layout="vertical">
                                    <NumberFormItem form={this.props.form} field="julianDate" label="Julian Date"
                                                    required={true}/>
                                    <IdNameSelectFormItem
                                        form={this.props.form}
                                        label="Star element"
                                        field="starElementId"
                                        options={this.props.elements}
                                        optionName={e => `${e.kind.name} (M0: ${e.minimum}, P: ${e.period})`}
                                        required={true}
                                        loading={false}
                                    />
                                    <IdNameSelectFormItem
                                        form={this.props.form}
                                        label="Method"
                                        field="methodId"
                                        options={methods}
                                        required={true}
                                        loading={loading}
                                    />
                                </Form>
                            )}
                        </ObservationsConsumer>
                    </Modal>
                </div>
            )
        }
    });

const StarElementItem = Form.create()(
    class extends Component {
        static kindNames = {
            'S': 'Secondary',
            'P': 'Primary'
        };

        static defaultProps = {
            onChange: () => {
            }
        };

        constructor(props) {
            super(props);
            this.state = {minimaShow: false, loading: false};
        }

        handleDelete = () => {
            axios.delete(BASE_URL + "/ocgate/stars/elements/" + this.props.element.id)
                .then(result => {
                    notification.success({
                        message: "Element deleted"
                    });
                    this.props.onChange()
                })
                .catch(reason => {
                    // :(
                });
        };

        handleEdit = () => {
            this.setState({...this.state, modalVisible: true});
        };

        handleEditSubmit = () => {
            this.props.form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    this.setState({...this.state, loading: true});
                    axios.put(BASE_URL + "/ocgate/stars/elements/" + this.props.element.id, values)
                        .then(result => {
                            notification.success({
                                message: "Edited star element information"
                            });
                            this.setState({...this.state, loading: false});
                            this.props.onChange();
                        })
                        .catch(reason => {
                            // :(
                        });
                }
            });
        };

        render() {
            let spanStyle = {display: "inline-block", width: 50, marginRight: "0.25rem"};
            return (
                <div>
                    <div><b
                        style={{marginRight: "0.5rem"}}>{StarElementItem.kindNames[this.props.element.kind.name]}:</b><EditDeleteAnchorButtons
                        onEdit={this.handleEdit} onDelete={this.handleDelete}/></div>
                    <div><span style={spanStyle}>M0:</span> {this.props.element.minimum}</div>
                    <div><span style={spanStyle}>Period:</span> {this.props.element.period}</div>
                    <div>
                        <div style={this.state.minimaShow ? {marginBottom: "0.5rem"} : {}}>
                            Minimas: {this.props.element.minimas.length} <AnchorButton size="small"
                                                                                       disabled={!this.props.element.minimas.length}
                                                                                       onClick={() => this.setState({minimaShow: !this.state.minimaShow})}>{this.state.minimaShow ? 'Hide' : 'Show'}</AnchorButton>
                        </div>
                        <AnimateHeight height={this.state.minimaShow ? "auto" : 0}>
                            <StarMinimaInfoTableComponent onChange={this.props.onChange}
                                                          minimas={this.props.element.minimas}/>
                        </AnimateHeight>
                    </div>
                    <Modal
                        visible={this.state.modalVisible}
                        title="Edit star element"
                        okText="Submit"
                        destroyOnClose={true}
                        onCancel={() => this.setState({...this.state, modalVisible: false})}
                        onOk={this.handleEditSubmit}
                        confirmLoading={this.state.loading}
                    >
                        <ObservationsConsumer>
                            {({loading, kinds}) => (
                                <Form layout="vertical">
                                    <IdNameSelectFormItem loading={loading} form={this.props.form}
                                                          label="Kind"
                                                          field="kindId" initialValue={this.props.element.kind.id}
                                                          options={kinds} required={true}/>
                                    <NumberFormItem form={this.props.form} label="M0"
                                                    field="minimum" initialValue={this.props.element.minimum}/>
                                    <NumberFormItem form={this.props.form} label="Period"
                                                    field="period" initialValue={this.props.element.period}/>
                                </Form>
                            )}
                        </ObservationsConsumer>
                    </Modal>
                </div>
            );
        }
    });

const StarElementsInfoComponent = Form.create()(
    class extends Component {

        constructor(props) {
            super(props);
            this.state = {
                modalVisible: false,
                loading: false
            }
        }

        handleAdd = () => {
            this.setState({
                modalVisible: true
            })
        };

        handleAddSubmit = () => {
            this.props.form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    values["publicationIds"] = [];
                    this.setState({...this.state, loading: true});
                    axios.post(BASE_URL + `/ocgate/stars/${this.props.star.id}/elements`, values)
                        .then(result => {
                            notification.success({
                                message: "Added new element"
                            });
                            this.setState({...this.state, modalVisible: false, loading: false});
                            this.props.onChange();
                        })
                        .catch(reason => {
                            // :(
                        });
                }
            });
        };

        render() {
            return (
                <div style={{marginTop: "0.5rem"}}>
                    <Modal
                        visible={this.state.modalVisible}
                        title="Add new element"
                        okText="Add"
                        destroyOnClose={true}
                        onCancel={() => this.setState({...this.state, modalVisible: false})}
                        onOk={this.handleAddSubmit}
                        confirmLoading={this.state.loading}
                    >
                        <ObservationsConsumer>
                            {({kinds, loading}) => (
                                <Form layout="vertical">
                                    <IdNameSelectFormItem loading={loading} form={this.props.form}
                                                          label="Kind"
                                                          field="kindId"
                                                          options={kinds} required={true}/>
                                    <NumberFormItem form={this.props.form} label="M0"
                                                    field="minimum"/>
                                    <NumberFormItem form={this.props.form} label="Period"
                                                    field="period"/>
                                </Form>
                            )}
                        </ObservationsConsumer>
                    </Modal>
                    <h3>Elements <Button size="small" type="primary"
                                         onClick={this.handleAdd}>Add</Button></h3>
                    {this.props.elements.map(e => (
                        <StarElementItem onChange={this.props.onChange} element={e} key={e.id}/>))}
                </div>
            )
        }
    });

const StarGenericInfoComponent = Form.create()(
    class extends Component {
        static defaultProps = {
            onChange: () => {
            }
        };

        constructor(props) {
            super(props);
            this.state = {
                deleted: false,
                modalVisible: false
            };
        }

        handleEdit = () => {
            this.setState({...this.state, modalVisible: true});
        };

        handleEditSubmit = () => {
            this.props.form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    this.setState({...this.state, loading: true});
                    axios.put(BASE_URL + "/ocgate/stars/" + this.props.star.id, values)
                        .then(result => {
                            notification.success({
                                message: "Edited star information"
                            });
                            this.setState({...this.state, loading: false});
                            this.props.onChange();
                        })
                        .catch(reason => {
                            // :(
                        });
                }
            });
        };

        handleDelete = () => {
            axios.delete(BASE_URL + "/ocgate/stars/" + this.props.star.id)
                .then(result => {
                    notification.success({
                        message: "Star deleted"
                    });
                    this.setState({...this.state, deleted: true});
                })
                .catch(reason => {
                    // :(
                });
        };

        render() {
            if (this.state.deleted) {
                return (
                    <Redirect to="/admin/ocgate/stars"/>
                );
            }
            return (
                <div>
                    <h2>{this.props.star.name} {this.props.star.constellation.abbreviation} {this.props.star.comp && (
                        <span> ({this.props.star.comp})</span>)}
                        <EditDeleteAnchorButtons onEdit={this.handleEdit} onDelete={this.handleDelete}
                                                 style={{marginLeft: "0.5rem"}}/>
                    </h2>
                    <div><b>Constellation: </b> {this.props.star.constellation.name}</div>
                    <div>
                        <b>Coordinates: </b> {this.props.star.coordinates.raString} {this.props.star.coordinates.decString}
                    </div>
                    <div><b>Type: </b> {this.props.star.type}</div>
                    <Modal
                        visible={this.state.modalVisible}
                        title="Edit star"
                        okText="Submit"
                        destroyOnClose={true}
                        onCancel={() => this.setState({...this.state, modalVisible: false})}
                        onOk={this.handleEditSubmit}
                        confirmLoading={this.state.loading}
                    >
                        <EntitiesConsumer>
                            {({constellations, types, loading}) => (
                                <Form layout="vertical">
                                    <CoordinatesFormItem form={this.props.form} required={true}
                                                         initialValue={this.props.star.coordinates}/>
                                    <InputFormItem form={this.props.form} label="Name" field="name" required={true}
                                                   initialValue={this.props.star.name}/>
                                    <IdNameSelectFormItem
                                        form={this.props.form}
                                        field="constellationId"
                                        label="Constellation"
                                        placeholder="Select a constellation"
                                        required={true}
                                        loading={loading}
                                        options={constellations}
                                        initialValue={this.props.star.constellation.id}
                                        optionName={(cons) => `${cons.abbreviation} (${cons.name})`}/>

                                    <InputFormItem form={this.props.form} label="Comp" field="comp"
                                                   initialValue={this.props.star.comp}/>
                                    <TypeFormItem form={this.props.form} types={types} loading={loading}
                                                  initialValue={this.props.star.type}/>
                                </Form>
                            )}
                        </EntitiesConsumer>
                    </Modal>
                </div>
            );
        }
    });

export class OcGateAdminStarDetailPage extends Component {
    constructor(props) {
        super(props);
        this.state = {star: null, minimas: []};
    }

    componentDidMount = () => {
        this.setState({star: null, minimas: []});
        axios.get(BASE_URL + "/ocgate/stars/" + this.props.match.params.id)
            .then(result => {
                const minimas = [];
                result.data.elements.forEach(e => {
                    e.minimas.forEach(m => {
                        minimas.push({
                            id: m.id,
                            julianDate: m.julianDate,
                            method: m.method,
                            kind: e.kind
                        });
                    });
                });
                minimas.sort((a, b) => {
                    return a.julianDate - b.julianDate;
                });

                this.setState({star: result.data, minimas})
            })
            .catch()
    };

    render() {
        return (
            <Layout.Content style={{margin: "24px 24px 0"}}>
                <Card loading={this.state.star == null}>
                    {this.state.star && (
                        <Fragment>
                            <StarGenericInfoComponent star={this.state.star} onChange={this.componentDidMount}/>
                            <StarBrightnessInfoComponent star={this.state.star} brightness={this.state.star.brightness}
                                                         onChange={this.componentDidMount}/>
                            <StarElementsInfoComponent star={this.state.star} onChange={this.componentDidMount}
                                                       elements={this.state.star.elements}/>
                            <StarMinimaInfoComponent elements={this.state.star.elements}
                                                     minimas={this.state.minimas}
                                                     onChange={this.componentDidMount}/>
                        </Fragment>
                    )}
                </Card>
            </Layout.Content>
        );
    }
}
