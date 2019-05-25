import React, {Component, Fragment} from "react";
import axios from "axios";
import {BASE_URL} from "../../../api-endpoint";
import {Table, Layout, Card, Button, Modal, Form, notification, Spin, TreeSelect, Cascader} from "antd";
import {AnchorButton} from "../../common/AnchorButton";
import {
    CascaderFormItem,
    CoordinatesFormItem, IdNameSelectFormItem,
    InputFormItem, MyForm,
    NumberFormItem, PublicationEntriesFormItem, TextAreaFormItem,
    TypeFormItem
} from "../../common/FormItems";
import {ObservationsConsumer} from "../ObservationsContext";
import AnimateHeight from "react-animate-height";
import {EditDeleteAnchorButtons} from "../../common/EditDeleteAnchorButtons";
import {Redirect} from "react-router-dom";
import {EntitiesConsumer} from "../../common/EntitiesContext";
import {PromiseFormModal} from "../../common/PromiseFormModal";
import {MinimaPublicationsConsumer} from "../../common/MinimaPublicationsContext";

// For new minima component
// Publication Entry Component
// publicationEntries
// Use nested dropdown?/whatever to choose publication -> volume /// volumeId
// another input for page /// page
// save

// UPDATE? ako?
// update/delete po jednom?
// add po jednom?

class EditDeletePart extends Component {
    static defaultProps = {
        onChange: () => {
        },
        onDelete: () => {
        }
    };

    constructor(props) {
        super(props);
        this.state = {modalVisible: false};
    }

    handleDelete = () => {
        let url = this.props.url;
        if (url instanceof Function) {
            url = url()
        }
        axios.delete(url)
            .then(result => {
                notification.success({
                    message: "Deleted"
                });
                this.props.onDelete();
                this.props.onChange();
            })
            .catch(reason => {
                // :(
            });
    };

    handleChange = () => {
        this.setState({...this.state, modalVisible: false});
        this.props.onChange();
    };

    handleEdit = () => {
        this.setState({...this.state, modalVisible: true});
    };

    handleCancel = () => {
        this.setState({...this.state, modalVisible: false});
    };

    render() {
        return (
            <div>
                {this.props.render(<EditDeleteAnchorButtons onEdit={this.handleEdit} onDelete={this.handleDelete}/>)}
                <PromiseFormModal
                    visible={this.state.modalVisible}
                    title="Edit"
                    onCancel={this.handleCancel}
                    onOk={this.handleChange}
                    promise={axios.put}
                    url={this.props.url}
                    successMessage=""
                    render={this.props.modalFormRender}
                />
            </div>
        );
    }
}

class AddPart extends Component {
    static defaultProps = {
        valuesFix: (values) => values,
        onChange: () => {
        }
    };

    constructor(props) {
        super(props);
        this.state = {modalVisible: false};
    }

    handleChange = () => {
        this.setState({...this.state, modalVisible: false});
        this.props.onChange();
    };

    handleAdd = () => {
        this.setState({
            modalVisible: true
        })
    };

    handleCancel = () => {
        this.setState({
            modalVisible: false
        });
    };

    render() {
        return (
            <div style={{marginTop: "0.5rem"}}>
                <PromiseFormModal
                    visible={this.state.modalVisible}
                    title="Add"
                    onCancel={this.handleCancel}
                    onOk={this.handleChange}
                    promise={axios.post}
                    url={this.props.url}
                    successMessage=""
                    valuesFix={this.props.valuesFix}
                    render={this.props.modalFormRender}
                />
                {this.props.render(<Button size="small" type="primary" onClick={this.handleAdd}>Add</Button>)}
            </div>
        );
    }

}

class StarBrightnessItem extends Component {
    static defaultProps = {
        onChange: () => {
        }
    };

    render() {
        return (
            <EditDeletePart
                url={BASE_URL + "/ocgate/stars/brightness/" + this.props.brightness.id}
                onChange={this.props.onChange}
                render={btns => {
                    const spanStyle = {
                        display: "inline-block",
                        width: 100,
                        marginRight: "0.5rem"
                    };
                    return (
                        <Fragment>
                            <b style={{marginRight: "0.5rem"}}>{this.props.brightness.filter.name}:</b>
                            <span style={spanStyle}>MIN S: {this.props.brightness.minS}</span>
                            <span style={spanStyle}>MIN P: {this.props.brightness.minP}</span>
                            <span style={spanStyle}>MAX P: {this.props.brightness.maxP}</span>
                            {btns}
                        </Fragment>
                    );
                }}
                modalFormRender={form => (
                    <ObservationsConsumer>
                        {({loading, filters}) => (
                            <MyForm layout="vertical" form={form}>
                                <IdNameSelectFormItem loading={loading}
                                                      label="Filter"
                                                      field="filterId"
                                                      initialValue={this.props.brightness.filter.id}
                                                      options={filters} required={true}/>
                                <NumberFormItem label="Min S"
                                                initialValue={this.props.brightness.minS}
                                                field="minS"/>
                                <NumberFormItem label="Min P"
                                                initialValue={this.props.brightness.minP}
                                                field="minP"/>
                                <NumberFormItem label="Max P"
                                                initialValue={this.props.brightness.maxP}
                                                field="maxP"/>
                            </MyForm>
                        )}
                    </ObservationsConsumer>
                )}
            />
        );
    }
}

class StarBrightnessInfoComponent extends Component {
    render() {
        return (<AddPart
                url={BASE_URL + `/ocgate/stars/${this.props.star.id}/brightness`}
                onChange={this.props.onChange}
                render={btn => (
                    <Fragment>
                        <h3>Brightness ({this.props.brightness.length}) {btn}</h3>
                        {this.props.brightness.map(b => (
                            <StarBrightnessItem onChange={this.props.onChange} brightness={b} key={b.id}/>))}
                    </Fragment>
                )}
                modalFormRender={form => (
                    <ObservationsConsumer>
                        {({filters, loading}) => (
                            <MyForm layout="vertical" form={form}>
                                <IdNameSelectFormItem loading={loading}
                                                      label="Filter"
                                                      field="filterId"
                                                      options={filters} required={true}/>
                                <NumberFormItem label="Min S"
                                                field="minS"/>
                                <NumberFormItem label="Min P"
                                                field="minP"/>
                                <NumberFormItem label="Max P"
                                                field="maxP"/>
                            </MyForm>
                        )}
                    </ObservationsConsumer>
                )}
            />
        );
    }
}

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
                    if (!values.publicationEntries) {
                        values.publicationEntries = []
                    } else {
                        values.publicationEntries.forEach(entry => {
                            entry.volumeId = entry.volumeId[1];
                        });
                    }
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
                        <MinimaPublicationsConsumer>
                            {({publications, loading: publicationsLoading}) => (
                                <ObservationsConsumer>
                                    {({methods, loading}) => (
                                        <MyForm layout="vertical" form={this.props.form}>
                                            <NumberFormItem field="julianDate"
                                                            label="Julian Date"
                                                            required={true}
                                                            initialValue={this.state.minima.julianDate}/>
                                            <IdNameSelectFormItem
                                                initialValue={this.state.minima.method.id}
                                                label="Method"
                                                field="methodId"
                                                options={methods}
                                                required={true}
                                                loading={loading}
                                            />
                                            <PublicationEntriesFormItem initialValue={this.state.minima.publicationEntries}/>
                                        </MyForm>
                                    )}
                                </ObservationsConsumer>
                            )}
                        </MinimaPublicationsConsumer>
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

class StarMinimaInfoComponent extends Component {
    render() {
        return (
            <AddPart
                valuesFix={(values) => {
                    if (!values.publicationEntries) {
                        values.publicationEntries = []
                    } else {
                        values.publicationEntries.forEach(entry => {
                            entry.volumeId = entry.volumeId[1];
                        });
                    }
                    // TODO validate maybe more?
                    values.julianDates = values.julianDates.split(/\r\n|\r|\n|\s|,/g).filter(v => v);
                    return values;
                }}
                url={BASE_URL + "/ocgate/minima"}
                onChange={this.props.onChange}
                render={btn => (
                    <Fragment>
                        <h3>Minimas ({this.props.minimas.length}) {btn}</h3>
                        <StarMinimaInfoTableComponent onChange={this.props.onChange} showKind={true}
                                                      minimas={this.props.minimas}/>

                    </Fragment>
                )}
                modalFormRender={form => (
                    <MinimaPublicationsConsumer>
                        {({publications, loading: publicationsLoading}) => (
                    <ObservationsConsumer>
                        {({methods, loading}) => (
                            <MyForm layout="vertical" form={form}>
                                <TextAreaFormItem
                                    field="julianDates" label="Julian Dates"
                                    required={true}/>
                                <IdNameSelectFormItem
                                    label="Star element"
                                    field="starElementId"
                                    options={this.props.elements}
                                    optionName={e => `${e.kind.name} (M0: ${e.minimum}, P: ${e.period})`}
                                    required={true}
                                    loading={false}
                                />
                                <IdNameSelectFormItem
                                    label="Method"
                                    field="methodId"
                                    options={methods}
                                    required={true}
                                    loading={loading}
                                />
                                <PublicationEntriesFormItem/>
                            </MyForm>
                        )}
                    </ObservationsConsumer>
                        )}
                    </MinimaPublicationsConsumer>
                )}
            />
        );
    }
}

class StarElementItem extends Component {
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
        this.state = {minimaShow: false};
    }

    render() {
        return (
            <EditDeletePart
                url={BASE_URL + "/ocgate/stars/elements/" + this.props.element.id}
                onChange={this.props.onChange}
                render={btns => {
                    let spanStyle = {display: "inline-block", width: 50, marginRight: "0.25rem"};
                    return (
                        <Fragment>
                            <div><b
                                style={{marginRight: "0.5rem"}}>{StarElementItem.kindNames[this.props.element.kind.name]}:</b>{btns}
                            </div>
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
                        </Fragment>
                    );
                }}
                modalFormRender={form => (
                    <ObservationsConsumer>
                        {({loading, kinds}) => (
                            <MyForm layout="vertical" form={form}>
                                <IdNameSelectFormItem loading={loading}
                                                      label="Kind"
                                                      field="kindId" initialValue={this.props.element.kind.id}
                                                      options={kinds} required={true}/>
                                <NumberFormItem label="M0"
                                                field="minimum" initialValue={this.props.element.minimum}/>
                                <NumberFormItem label="Period"
                                                field="period" initialValue={this.props.element.period}/>
                            </MyForm>
                        )}
                    </ObservationsConsumer>)}
            />
        );
    }
}

class StarElementsInfoComponent extends Component {
    render() {
        return (
            <AddPart
                url={BASE_URL + `/ocgate/stars/${this.props.star.id}/elements`}
                onChange={this.props.onChange}
                render={btn => (
                    <Fragment>
                        <h3>Elements ({this.props.elements.length}) {btn}</h3>
                        {this.props.elements.map(e => (
                            <StarElementItem onChange={this.props.onChange} element={e} key={e.id}/>))}

                    </Fragment>
                )}
                modalFormRender={form => (
                    <ObservationsConsumer>
                        {({kinds, loading}) => (
                            <MyForm layout="vertical" form={form}>
                                <IdNameSelectFormItem loading={loading}
                                                      label="Kind"
                                                      field="kindId"
                                                      options={kinds} required={true}/>
                                <NumberFormItem label="M0"
                                                field="minimum"/>
                                <NumberFormItem label="Period"
                                                field="period"/>
                            </MyForm>
                        )}
                    </ObservationsConsumer>
                )}
            />
        );
    }
}

class StarGenericInfoComponent extends Component {
    static defaultProps = {
        onChange: () => {
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            deleted: false,
        };
    }

    render() {
        if (this.state.deleted) {
            return (
                <Redirect to="/admin/ocgate/stars"/>
            )
        }
        return (
            <EditDeletePart
                url={BASE_URL + "/ocgate/stars/" + this.props.star.id}
                onChange={this.props.onChange}
                onDelete={() => {
                    this.setState({...this.state, deleted: true});
                }}
                render={btns => {
                    return (
                        <Fragment>
                            <h2>{this.props.star.name} {this.props.star.constellation.abbreviation} {this.props.star.comp && (
                                <span> ({this.props.star.comp})</span>)}
                                <span style={{marginLeft: "0.5rem"}}>{btns}</span>
                            </h2>
                            <div><b>Constellation: </b> {this.props.star.constellation.name}</div>
                            <div>
                                <b>Coordinates: </b> {this.props.star.coordinates.raString} {this.props.star.coordinates.decString}
                            </div>
                            <div><b>Type: </b> {this.props.star.type}</div>
                            <div><b>Minima duration: </b> {this.props.star.minimaDuration}</div>
                        </Fragment>
                    );
                }}
                modalFormRender={form => (
                    <EntitiesConsumer>
                        {({constellations, types, loading}) => (
                            <MyForm layout="vertical" form={form}>
                                <CoordinatesFormItem required={true}
                                                     initialValue={this.props.star.coordinates}/>
                                <InputFormItem label="Name" field="name" required={true}
                                               initialValue={this.props.star.name}/>
                                <IdNameSelectFormItem
                                    field="constellationId"
                                    label="Constellation"
                                    placeholder="Select a constellation"
                                    required={true}
                                    loading={loading}
                                    options={constellations}
                                    initialValue={this.props.star.constellation.id}
                                    optionName={(cons) => `${cons.abbreviation} (${cons.name})`}/>

                                <InputFormItem label="Comp" field="comp"
                                               initialValue={this.props.star.comp}/>
                                <TypeFormItem types={types} loading={loading}
                                              initialValue={this.props.star.type}/>
                                <NumberFormItem label="Minima duration" field="minimaDuration" initialValue={this.props.star.minimaDuration}/>
                            </MyForm>
                        )}
                    </EntitiesConsumer>)}
            />
        );
    }
}

export class OcGateAdminStarDetailPage extends Component {
    constructor(props) {
        super(props);
        this.state = {star: null, minimas: [], loading: false};
    }

    componentDidMount = () => {
        this.setState({...this.state, loading: true});
        axios.get(BASE_URL + "/ocgate/stars/" + this.props.match.params.id)
            .then(result => {
                const minimas = [];
                result.data.elements.forEach(e => {
                    e.minimas.forEach(m => {
                        minimas.push({
                            id: m.id,
                            julianDate: m.julianDate,
                            method: m.method,
                            kind: e.kind,
                            publicationEntries: m.publicationEntries
                        });
                    });
                });
                minimas.sort((a, b) => {
                    return a.julianDate - b.julianDate;
                });

                this.setState({...this.state, loading: false, star: result.data, minimas})
            })
            .catch(reason => {

            });
    };

    render() {
        return (
            <Layout.Content style={{margin: "24px 24px 0"}}>
                <Card>
                    <Spin spinning={this.state.loading}>
                        {this.state.star && (
                            <Fragment>
                                <StarGenericInfoComponent star={this.state.star} onChange={this.componentDidMount}/>
                                <StarBrightnessInfoComponent star={this.state.star}
                                                             brightness={this.state.star.brightness}
                                                             onChange={this.componentDidMount}/>
                                <StarElementsInfoComponent star={this.state.star} onChange={this.componentDidMount}
                                                           elements={this.state.star.elements}/>
                                <StarMinimaInfoComponent elements={this.state.star.elements}
                                                         minimas={this.state.minimas}
                                                         onChange={this.componentDidMount}/>
                            </Fragment>
                        )}
                    </Spin>
                </Card>
            </Layout.Content>
        );
    }
}
