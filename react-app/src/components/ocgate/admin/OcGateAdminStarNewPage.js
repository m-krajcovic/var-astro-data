import React, {Component} from "react";
import {Card, Spin, Layout, Form, Row, Col} from "antd";
import {CoordinatesFormItem, IdNameSelectFormItem, InputFormItem, TypeFormItem} from "../../common/FormItems";
import axios from "axios";
import {BASE_URL} from "../../../api-endpoint";

// NEW STAR PAGE
//    GENERIC INFO
//    NEW BRIGHTNESS COMPONENT
//    NEW ELEMENT COMPONENT

class StarNewComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            constellationsLoading: true,
            constellations: []
        }
    }

    componentDidMount() {
        this.setState({...this.state, constellationsLoading: true});
        axios.get(BASE_URL + "/ocgate/constellations")
            .then(result => {
                this.setState({
                    ...this.state,
                    constellationsLoading: false,
                    constellations: result.data
                })
            })
            .catch(reason => {
                // :(
            })
    }

    render() {
        return (
            <Row gutter={8}>
                <Col span={24} sm={{span: 16}}>
                    <Form onSubmit={this.handleSubmit}>
                        <h3>Star Information</h3>
                        <IdNameSelectFormItem
                            form={this.props.form}
                            field="constellationId"
                            label="Constellation"
                            placeholder="Select a constellation"
                            loading={this.state.constellationsLoading}
                            required={true}
                            options={this.state.constellations}
                            optionName={(cons) => `${cons.abbreviation} (${cons.name})`}/>
                        <InputFormItem form={this.props.form} label="Name" field="name" required={true}/>
                        <InputFormItem form={this.props.form} label="Comp" field="comp"/>
                        <CoordinatesFormItem form={this.props.form} required={true}/>
                        {/* TODO: load types */}
                        <TypeFormItem form={this.props.form} types={[]}/>
                        <h3>Brightness</h3>
                        <h3>Elements</h3>
                    </Form>
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
                        <StarNewComponentForm />
                    {/*</Spin>*/}
                </Card>
            </Layout.Content>
        );
    }
}
