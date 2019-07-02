import React, {Component} from "react";
import {Button, Col, Input, Row, Slider, Spin} from "antd";
import {ToggleTagHeight} from "../common/ToggleTagHeight";
import {Form} from "antd";
import {Select} from "antd";
import {FormItem} from "../common/FormItems";

class CzevCatalogueAdvancedSearchComponent extends Component {
    static defaultProps = {
        onSubmit: () => {
        },
        loading: false
    };

    constructor(props) {
        super(props);
        this.state = {
            hidden: true
        };
        this.coordinatesRaRegexp = /^((\d*(\.\d+)?)|((\d{1,2})[\s:](\d{1,2})[\s:](\d{0,2}(\.\d+)?)))$/;
        this.coordinatesDecRegexp = /^(([+-]?\d*(\.\d+)?)|(([+-]?\d{1,2})[\s:](\d{1,2})[\s:](\d{0,2}(\.\d+)?)))$/;
        this.yearsDefaults = [1990, new Date().getFullYear()];
        this.yearMarks = {};
        this.yearMarks[this.yearsDefaults[0]] = "" + this.yearsDefaults[0];
        this.yearMarks[this.yearsDefaults[1]] = "" + this.yearsDefaults[1];
        this.amplitudeDefaults = [0, 2];
        this.amplitudeMarks = {};
        this.amplitudeMarks[this.amplitudeDefaults[0]] = "" + this.amplitudeDefaults[0];
        this.amplitudeMarks[this.amplitudeDefaults[1]] = "" + this.amplitudeDefaults[1];
    }

    handleClear = () => {
        this.props.onSubmit(null);
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const submittedValues = {};
                Object.keys(values).forEach(key => {
                    if (values[key] !== "" && values[key] != null) {
                        if (key === 'amplitude') {
                            if (values[key][0] !== this.amplitudeDefaults[0] || values[key][1] !== this.amplitudeDefaults[1]) {
                                submittedValues['amplitudeFrom'] = values[key][0];
                                submittedValues['amplitudeTo'] = values[key][1];

                            }
                        } else if (key === 'year') {
                            if (values[key][0] !== this.yearsDefaults[0] || values[key][1] !== this.yearsDefaults[1]) {
                                submittedValues['yearFrom'] = values[key][0];
                                submittedValues['yearTo'] = values[key][1];
                            }
                        } else {
                            submittedValues[key] = values[key];
                        }
                    }
                });
                this.props.onSubmit(submittedValues);
            }
        });
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <Spin spinning={this.props.loading}>
                <div style={{marginBottom: 12}}>
                    <ToggleTagHeight tag="Advanced Search">

                        <Form style={{marginTop: 8}} className="czev-catalogue-search-form"
                              onSubmit={this.handleSubmit}>
                            <Row gutter={24}>
                                <Col span={24} md={{span: 8}}>
                                    <FormItem label="RA">
                                        {getFieldDecorator('ra', {
                                            rules: [{
                                                pattern: this.coordinatesRaRegexp,
                                                message: 'The input is not valid right ascension!',
                                            }]
                                        })(
                                            <Input/>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={24} md={{span: 8}}>
                                    <FormItem label="DEC">
                                        {getFieldDecorator('dec', {
                                            rules: [{
                                                pattern: this.coordinatesDecRegexp,
                                                message: 'The input is not valid right ascension!',
                                            }]
                                        })(
                                            <Input/>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={24} md={{span: 8}}>
                                    <FormItem label="Radius">
                                        {getFieldDecorator('radius', {
                                            initialValue: 0.01
                                        })(
                                            <Input style={{width: "100%"}} addonAfter="deg"/>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={24} md={{span: 8}}>
                                    <FormItem label="Constellation">
                                        {getFieldDecorator('constellation', {})(
                                            <Select
                                                showSearch
                                                optionFilterProp="children"
                                            >
                                                {this.props.entities.constellations.map(cons => {
                                                    return (
                                                        <Select.Option
                                                            key={cons.id}>{cons.abbreviation} ({cons.name})</Select.Option>
                                                    )
                                                })}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={24} md={{span: 8}}>
                                    <FormItem label="Discoverer">
                                        {getFieldDecorator('discoverer', {})(
                                            <Select
                                                showSearch
                                                optionFilterProp="children"
                                            >
                                                {this.props.entities.observers.map(obs => {
                                                    return (
                                                        <Select.Option
                                                            key={obs.id}>{obs.firstName} {obs.lastName}</Select.Option>
                                                    )
                                                })}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={24} md={{span: 8}}>
                                    <FormItem label="Filter Band">
                                        {getFieldDecorator('filterBand', {})(
                                            <Select
                                                showSearch
                                                optionFilterProp="children"
                                            >
                                                {this.props.entities.filterBands.map(fb => {
                                                    return (
                                                        <Select.Option
                                                            key={fb.id}>{fb.name}</Select.Option>
                                                    )
                                                })}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={24} md={{span: 8}}>
                                    <FormItem label="Type">
                                        {getFieldDecorator('type', {})(
                                            <Input/>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={24} md={{span: 8}}>
                                    <FormItem label="Amplitude">
                                        {getFieldDecorator('amplitude', {
                                            initialValue: this.amplitudeDefaults
                                        })(
                                            <Slider step={0.01} min={this.amplitudeDefaults[0]}
                                                    max={this.amplitudeDefaults[1]} range marks={this.amplitudeMarks}/>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={24} md={{span: 8}}>
                                    <FormItem label="Year">
                                        {getFieldDecorator('year', {
                                            initialValue: [1990, 2018]
                                        })(
                                            <Slider min={this.yearsDefaults[0]} max={this.yearsDefaults[1]} range
                                                    marks={this.yearMarks}/>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24} style={{textAlign: "right"}}>
                                    <Button type="primary" htmlType="submit">Search</Button>
                                    <Button style={{marginLeft: 8}} htmlType="button"
                                            onClick={this.handleClear}>Clear</Button>
                                </Col>
                            </Row>
                        </Form>
                    </ToggleTagHeight>
                </div>
            </Spin>
        )
    }
}

export const CzevCatalogueAdvancedSearch = Form.create()(CzevCatalogueAdvancedSearchComponent);

