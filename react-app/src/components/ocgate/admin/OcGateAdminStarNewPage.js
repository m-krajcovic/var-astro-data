import React, {Component} from "react";
import {Card, Layout, Form, Row, Col, Button, notification} from "antd";
import {
    CoordinatesFormItem, FormItem, formItemLayoutWithOutLabel,
    IdNameSelectFormItem,
    InputFormItem, MyForm, NumberFormItem,
    TypeFormItem
} from "../../common/FormItems";
import axios from "axios";
import {BASE_URL} from "../../../api-endpoint";
import {ObservationsConsumer} from "../ObservationsContext";
import {Redirect} from "react-router-dom";
import {EntitiesConsumer} from "../../common/EntitiesContext";

class BrightnessSubFormComponent extends Component {

    addBrightness = () => {
        const {form} = this.props;
        const brightnessKeys = form.getFieldValue('brightnessKeys');

        const nextBrightnessKeys = brightnessKeys.length === 0 ? [0] : brightnessKeys.concat(brightnessKeys[brightnessKeys.length - 1] + 1);

        form.setFieldsValue({
            brightnessKeys: nextBrightnessKeys
        });
    };

    removeBrightness = (k) => {
        const {form} = this.props;
        const brightnessKeys = form.getFieldValue('brightnessKeys');
        form.setFieldsValue({
            brightnessKeys: brightnessKeys.filter(key => key !== k),
        });
    };

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;

        getFieldDecorator('brightnessKeys', {initialValue: [0]});
        const brightnessKeys = getFieldValue('brightnessKeys');

        return (
            <div style={{marginBottom: "1rem"}}>
                <h3>Brightness <Button onClick={this.addBrightness} size="small" type="primary">Add</Button></h3>
                <div>
                    {brightnessKeys.length === 0 ? (
                        <span>Add new brightness information by clicking on the Add button.</span>) : (
                        <ObservationsConsumer>
                            {({filters, loading}) => {
                                return brightnessKeys.map(k => {
                                    return (
                                        <div className="brightness-item-wrapper" key={k}>
                                            <IdNameSelectFormItem loading={loading} form={this.props.form}
                                                                  label="Filter"
                                                                  field={`brightness[${k}].filterId`}
                                                                  options={filters} required={true}/>
                                            <NumberFormItem form={this.props.form} label="Min S"
                                                            field={`brightness[${k}].minS`}/>
                                            <NumberFormItem form={this.props.form} label="Min P"
                                                            field={`brightness[${k}].minP`}/>
                                            <NumberFormItem form={this.props.form} label="Max P"
                                                            field={`brightness[${k}].maxP`}/>
                                            {brightnessKeys.length > 1 && (
                                                <FormItem {...formItemLayoutWithOutLabel}>
                                                    <Button onClick={() => this.removeBrightness(k)}
                                                            type="danger">Remove</Button>
                                                </FormItem>
                                            )}
                                        </div>
                                    )
                                });
                            }}
                        </ObservationsConsumer>
                    )}
                </div>
            </div>
        );
    }
}


class ElementsSubFormComponent extends Component {

    addElement = () => {
        const {form} = this.props;
        const elementKeys = form.getFieldValue('elementKeys');

        const nextElementKeys = elementKeys.length === 0 ? [0] : elementKeys.concat(elementKeys[elementKeys.length - 1] + 1);

        form.setFieldsValue({
            elementKeys: nextElementKeys
        });
    };

    removeElement = (k) => {
        const {form} = this.props;
        const elementKeys = form.getFieldValue('elementKeys');
        form.setFieldsValue({
            elementKeys: elementKeys.filter(key => key !== k),
        });
    };

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;

        getFieldDecorator('elementKeys', {initialValue: [0]});
        const elementKeys = getFieldValue('elementKeys');

        return (
            <div style={{marginBottom: "1rem"}}>
                <h3>Elements <Button onClick={this.addElement} size="small" type="primary">Add</Button></h3>
                <div>
                    {elementKeys.length === 0 ? (
                        <span>Add new element information by clicking on the Add button.</span>) : (
                        <ObservationsConsumer>
                            {({kinds, loading}) => {
                                return elementKeys.map(k => {
                                    return (
                                        <div className="brightness-item-wrapper" key={k}>
                                            <IdNameSelectFormItem loading={loading} form={this.props.form}
                                                                  label="Kind"
                                                                  field={`elements[${k}].kindId`}
                                                                  options={kinds} required={true}/>
                                            <NumberFormItem form={this.props.form} label="M0"
                                                            field={`elements[${k}].minimum`}/>
                                            <NumberFormItem form={this.props.form} label="Period"
                                                            field={`elements[${k}].period`}/>
                                            {elementKeys.length > 1 &&
                                            (
                                                <FormItem {...formItemLayoutWithOutLabel}>
                                                    <Button onClick={() => this.removeElement(k)}
                                                            type="danger">Remove</Button>
                                                </FormItem>
                                            )}

                                        </div>
                                    )
                                });
                            }}
                        </ObservationsConsumer>
                    )}
                </div>
            </div>
        );
    }
}


class StarNewComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            finished: false
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                delete values["brightnessKeys"];
                delete values["elementKeys"];
                // if (!values.type) {
                //     values.type = "";
                // }
                return axios.post(BASE_URL + "/ocgate/stars", values).then(result => {
                    notification.success({
                        message: (<span>Star added to the database</span>)
                    });
                    this.setState({...this.state, finished: true});
                }).catch(e => {
                    return e;
                });
            }
        });
    };

    render() {
        if (this.state.finished) {
            return (
                <Redirect to="/admin/ocgate/stars"/>
            )
        }

        return (
            <Row gutter={8}>
                <Col span={24} sm={{span: 16}}>
                    <EntitiesConsumer>
                        {({constellations, types, loading}) => (
                            <MyForm onSubmit={this.handleSubmit} form={this.props.form}>
                                <h3>Star Information</h3>
                                <CoordinatesFormItem required={true}/>
                                <InputFormItem label="Name" field="name" required={true}/>
                                <IdNameSelectFormItem

                                    field="constellationId"
                                    label="Constellation"
                                    placeholder="Select a constellation"
                                    loading={loading}
                                    required={true}
                                    options={constellations}
                                    optionName={(cons) => `${cons.abbreviation} (${cons.name})`}/>
                                <InputFormItem label="Comp" field="comp"/>
                                <TypeFormItem types={types} initialValue={""} loading={loading}/>
                                <NumberFormItem label="Minima duration" field="minimaDuration"/>

                                <BrightnessSubFormComponent/>

                                <ElementsSubFormComponent/>

                                <FormItem
                                    wrapperCol={{
                                        xs: {span: 24, offset: 0},
                                        sm: {span: 18, offset: 6},
                                    }}
                                >
                                    <Button type="primary" htmlType="submit">Submit</Button>
                                </FormItem>
                            </MyForm>
                        )}
                    </EntitiesConsumer>
                </Col>
            </Row>
        );
    }
}

const StarNewComponentForm = Form.create()(StarNewComponent);

export class OcGateAdminStarNewPage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Layout.Content style={{margin: "24px 24px 0"}}>
                <Card>
                    {/*<Spin>*/}
                    <StarNewComponentForm/>
                    {/*</Spin>*/}
                </Card>
            </Layout.Content>
        );
    }
}
