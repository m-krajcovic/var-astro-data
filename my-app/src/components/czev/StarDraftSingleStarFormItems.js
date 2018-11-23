import React, {Component, Fragment} from "react";
import {AutoComplete, Button, Checkbox, Col, Icon, InputNumber, Select, Spin, Tooltip, Form, Input} from "antd";

export class StarDraftSingleStarFormItems extends Component {
    constructor(props) {
        super(props);
        this.defaultTypes = ["EB", "EW", "EA", "DSCT", "HADS", "RRAB", "RRC", "ELL", "UV", "M", "SR", "CV", "ACV", "DCEP"];
        this.crossIdRegexp = /((UCAC4\s\d{3}-\d{6})|(USNO-B[12]\.0\s\d{4}-\d{7}))/;
        // this.coordinatesRegexp = /((\\d*(\\.\\d+)?)\\s+([+\\-]?\\d*(\\.\\d+)?))|((\\d{1,2})[\\s:](\\d{1,2})[\\s:](\\d{0,2}(\\.\\d+)?)\\s([+\\-]?\\d{1,2})[\\s:](\\d{1,2})[\\s:](\\d{0,2}(\\.\\d+)?))$/;
        this.coordinatesRaRegexp = /^((\d*(\.\d+)?)|((\d{1,2})[\s:](\d{1,2})[\s:](\d{0,2}(\.\d+)?)))$/;
        this.coordinatesDecRegexp = /^(([+-]?\d*(\.\d+)?)|(([+-]?\d{1,2})[\s:](\d{1,2})[\s:](\d{0,2}(\.\d+)?)))$/;

        this.state = {
            typeOptions: this.defaultTypes,
            typeUncertain: false,
            typeValid: true,
        }
    }

    removeCrossId = (k) => {
        const {form} = this.props;
        // can use data-binding to get
        const crossidKeys = form.getFieldValue('crossidKeys');
        // We need at least one passenger
        if (crossidKeys.length === 1) {
            return;
        }

        // can use data-binding to set
        form.setFieldsValue({
            crossidKeys: crossidKeys.filter(key => key !== k),
        });
    };

    addCrossId = () => {
        const {form} = this.props;
        // can use data-binding to get
        const crossidKeys = form.getFieldValue('crossidKeys');
        const nextKeys = crossidKeys.concat(crossidKeys[crossidKeys.length - 1] + 1);
        // can use data-binding to set
        // important! notify form to detect changes
        form.setFieldsValue({
            crossidKeys: nextKeys,
        });
    };

    handleTypeSearch = (value) => {
        if (!value) {
            this.setState({...this.state, typeOptions: this.defaultTypes})
        } else {
            let filtered = this.defaultTypes.filter(t => t.toLowerCase().includes(value.toLowerCase()));
            if (filtered.length === 1) {
                filtered = filtered.concat([
                    `${filtered[0]}:`,
                    `${filtered[0]}/`,
                    `${filtered[0]}|`,
                    `${filtered[0]}+`,
                ])
            }
            this.setState({...this.state, typeOptions: filtered});
        }
    };

    handleTypeUncertainChange = (e) => {
        const uncertain = e.target.checked;
        this.setState({...this.state, typeUncertain: uncertain});
        const {form} = this.props;
        let type = form.getFieldValue('type');
        if (!type) {
            type = ""
        }
        if ((uncertain && type.endsWith(':')) || (!uncertain && !type.endsWith(':'))) {
        } else {
            if (uncertain) {
                form.setFieldsValue({
                    type: type + ":"
                });
            } else {
                form.setFieldsValue({
                    type: type.substring(0, type.length - 1)
                });
            }
        }
    };

    handleTypeChange = (value) => {
        const uncertain = this.state.typeUncertain;
        if (!value) {
            value = "";
        } else {
            let typeValid = true;
            const certainType = value[value.length - 1] === ':' ? value.substring(0, value.length - 1) : value;
            const types = certainType.split(/[|+/]/);
            types.forEach(type => {
                if (!this.props.entities.types.has(type)) {
                    typeValid = false;
                }
            });
            this.setState({...this.state, typeValid: typeValid});
        }
        if (uncertain && !value.endsWith(':')) {
            this.setState({...this.state, typeUncertain: false});
        } else if (!uncertain && value.endsWith(':')) {
            this.setState({...this.state, typeUncertain: true});
        }
    };

    validateDecRange = (rule, value, callback) => {
        callback();
    };

    validateRaRange = (rule, value, callback) => {
        callback();
    };

    render() {
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 18},
            },
        };
        const formItemLayoutWithOutLabel = {
            wrapperCol: {
                xs: {span: 24, offset: 0},
                sm: {span: 18, offset: 6},
            },
        };
        const currentYear = new Date().getFullYear();
        const {getFieldDecorator, getFieldValue} = this.props.form;

        getFieldDecorator('crossidKeys', {initialValue: [0]});
        const crossIds = getFieldValue('crossidKeys');

        const crossIdFormItems = crossIds.map((k, index) => {
            return (
                <Form.Item
                    {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                    label={index === 0 ? 'Cross identifications' : ''}
                    required={true}
                    key={k}
                >
                    {getFieldDecorator(`crossIds[${k}]`, {
                        validateTrigger: ['onChange', 'onBlur'],
                        rules: [{
                            required: true,
                            whitespace: true,
                            message: k === 0 ? "Please input valid UCAC4/USNO-B identification" : "Please input valid cross id or delete this field.",
                        }].concat(k === 0 ? {
                            pattern: this.crossIdRegexp, message: "Please input valid UCAC4/USNO-B identification"
                        } : []),
                    })(
                        <Input onBlur={() => {
                            if (k === 0) {
                                this.props.onCrossIdBlur()
                            }
                        }} placeholder="Cross id" style={{width: "90%", marginRight: 8}}
                               suffix={(
                                   <Tooltip title="Search in catalogues"><Icon type="search" className="clickable-icon"
                                                                               onClick={() => this.props.onCrossIdSearch(getFieldValue(`crossIds[${k}]`))}/></Tooltip>)}/>
                    )}
                    {k > 0 ? (
                        <Icon
                            className="dynamic-delete-button"
                            type="minus-circle-o"
                            disabled={crossIds.length === 1}
                            onClick={() => this.removeCrossId(k)}
                        />
                    ) : null}
                </Form.Item>
            )
        });

        return (
            <Fragment>
                <Form.Item {...formItemLayout} label="Coordinates (J2000)" required={true}>
                    <Col span={12}>
                        <Form.Item>
                            {getFieldDecorator('coordinatesRa', {
                                rules: [{
                                    pattern: this.coordinatesRaRegexp,
                                    message: 'The input is not valid right ascension!',
                                }, {
                                    required: true, message: 'Please input the right ascension!',
                                }, {
                                    validator: this.validateRaRange
                                }],
                            })(
                                <Input placeholder="Right ascension" onBlur={this.props.onCoordsBlur}
                                       style={{
                                           borderTopRightRadius: 0,
                                           borderBottomRightRadius: 0
                                       }}/>
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item>
                            {getFieldDecorator('coordinatesDec', {
                                rules: [{
                                    pattern: this.coordinatesDecRegexp,
                                    message: 'The input is not valid declination!',
                                }, {
                                    required: true, message: 'Please input the declination!',
                                }, {
                                    validator: this.validateDecRange
                                }],
                            })(
                                <Input placeholder="Declination" onBlur={this.props.onCoordsBlur}
                                       style={{borderBottomLeftRadius: 0, borderTopLeftRadius: 0}}/>
                            )}
                        </Form.Item>
                    </Col>
                </Form.Item>
                {crossIdFormItems}
                <Form.Item {...formItemLayoutWithOutLabel}>
                    <Button type="dashed" onClick={this.addCrossId} style={{width: "90%"}}>
                        <Icon type="plus"/> Add Cross id
                    </Button>
                </Form.Item>
                <Form.Item {...formItemLayout} label="Constellation">
                    <Spin spinning={this.props.entities.loading}>
                        {
                            getFieldDecorator('constellation', {
                                rules: [
                                    {required: true, message: "Please choose a constellation"}
                                ]
                            })(
                                <Select
                                    showSearch
                                    placeholder="Select a constellation"
                                    optionFilterProp="children"
                                >
                                    {this.props.entities.constellations.map(cons => {
                                        return (
                                            <Select.Option
                                                key={cons.id}>{cons.abbreviation} ({cons.name})</Select.Option>
                                        )
                                    })}
                                </Select>
                            )
                        }
                    </Spin>
                </Form.Item>
                <Form.Item {...formItemLayout} label="Discoverers">
                    <Spin spinning={this.props.entities.loading}>
                        {
                            getFieldDecorator('discoverers', {
                                rules: [
                                    {
                                        required: true,
                                        type: "array",
                                        message: "Choose at least one discoverer"
                                    }
                                ]
                            })(
                                <Select
                                    showSearch
                                    mode="multiple"
                                    placeholder="Select discoverers"
                                    optionFilterProp="children"
                                >
                                    {this.props.entities.observers.map(obs => {
                                        return (
                                            <Select.Option
                                                key={obs.id}>{obs.firstName} {obs.lastName}</Select.Option>
                                        )
                                    })}
                                </Select>
                            )
                        }
                    </Spin>
                </Form.Item>
                <Form.Item {...formItemLayout} label="Year">
                    {getFieldDecorator('year', {
                        rules: [{required: true, message: "Year of discovery is required"}],
                        initialValue: currentYear
                    })(
                        <InputNumber max={currentYear}/>
                    )}
                </Form.Item>
                <Form.Item style={{marginBottom: 0}} {...formItemLayout} label="Type"
                           validateStatus={!this.state.typeValid ? "warning" : ""}
                           help={!this.state.typeValid ? "This is not a valid VSX variable star type, but you can still submit it" : ""}
                           hasFeedback>
                    {getFieldDecorator('type', {})(
                        <AutoComplete
                            onSearch={this.handleTypeSearch}
                            dataSource={this.state.typeOptions}
                            onChange={this.handleTypeChange}>
                            <Input/>
                        </AutoComplete>
                    )}
                </Form.Item>
                <Form.Item {...formItemLayoutWithOutLabel} extra={(
                    <span>You can find more information about types <a target="_blank"
                                                                       rel="noopener noreferrer"
                                                                       href="https://www.aavso.org/vsx/index.php?view=about.vartypes">here</a></span>)}>
                    <Checkbox onChange={this.handleTypeUncertainChange}
                              checked={this.state.typeUncertain}>Type
                        uncertain</Checkbox>
                </Form.Item>
                <Form.Item {...formItemLayout} label="Amplitude">
                    {getFieldDecorator('amplitude', {
                        rules: [{
                            type: "number", message: "The input is not valid amplitude"
                        }],
                    })(
                        <InputNumber style={{width: "100%"}}/>
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="Filter band">
                    <Spin spinning={this.props.entities.loading}>
                        {getFieldDecorator('filterBand', {})(
                            <Select
                                allowClear
                                showSearch
                                placeholder="Select a filter band"
                                optionFilterProp="children"
                            >
                                {this.props.entities.filterBands.map(fb => {
                                    return (
                                        <Select.Option key={fb.id}>{fb.name}</Select.Option>
                                    )
                                })}
                            </Select>
                        )}
                    </Spin>
                </Form.Item>
                <Form.Item {...formItemLayout} label="Epoch">
                    {getFieldDecorator('epoch', {
                        rules: [{
                            type: "number", message: "The input is not valid epoch"
                        }],
                    })(
                        <InputNumber
                            min={2400000}
                            style={{width: "100%"}}/>
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="Period">
                    {getFieldDecorator('period', {
                        rules: [{
                            type: "number", message: "The input is not valid period"
                        }],
                    })(
                        <InputNumber style={{width: "100%"}}/>
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="Note">
                    {getFieldDecorator('note', {})(
                        <Input.TextArea/>
                    )}
                </Form.Item>
            </Fragment>
        )
    }
}
