import React, {Component, Fragment} from "react";
import {
    AutoComplete,
    Checkbox,
    Col,
    Input,
    Spin,
    Form,
    Select,
    Tooltip,
    Icon,
    Button,
    InputNumber,
    Cascader, Row
} from "antd";
import {MinimaPublicationsConsumer} from "./MinimaPublicationsContext";

export const formItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 6},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 18},
    },
};

export const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: {span: 24, offset: 0},
        sm: {span: 18, offset: 6},
    },
};

export class FormItem extends Component {
    render() {
        const {children, ...acyclicProps} = this.props;
        return (
            <Form.Item style={{marginBottom: 12}} {...acyclicProps}>
                {children}
            </Form.Item>
        );
    }
}

class MyFormItem extends Component {
    render() {
        const layout = this.props.label == null ? formItemLayoutWithOutLabel : formItemLayout;
        return (
            <FormItem style={{marginBottom: 12}} {...layout} label={this.props.label} required={this.props.required}>
                {this.props.children}
            </FormItem>
        );
    }
}

export class MyForm extends Component {
    render() {
        let {children} = this.props;
        const childrenWithProps = React.Children.map(children, child =>
            React.cloneElement(child, {
                form: this.props.form,
                layout: this.props.layout
            })
        );

        return (
            <Form layout={this.props.layout} onSubmit={this.props.onSubmit}>
                {childrenWithProps}
            </Form>
        );
    }
}

export class TypeFormItem extends Component {
    constructor(props) {
        super(props);
        this.defaultTypes = ["EB", "EW", "EA", "DSCT", "HADS", "RRAB", "RRC", "ELL", "UV", "M", "SR", "CV", "ACV", "DCEP"];
        this.state = {
            typeOptions: [],
            typeValid: true,
            typeUncertain: false,
        };
    }

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
                if (!this.props.types.has(type)) {
                    typeValid = false;
                }
            });
            this.setState(state => {
                return {
                    ...state,
                    typeValid: typeValid
                };
            });
        }
        if (uncertain && !value.endsWith(':')) {
            this.setState(state => {
                return {
                    ...state,
                    typeUncertain: false
                };
            });
        } else if (!uncertain && value.endsWith(':')) {
            this.setState(state => {
                return {
                    ...state,
                    typeUncertain: true
                };
            });
        }
    };

    render() {
        const {getFieldDecorator} = this.props.form;

        return (
            <Fragment>
                <Form.Item style={{marginBottom: 0}} {...formItemLayout} label="Type"
                           validateStatus={!this.state.typeValid ? "warning" : ""}
                           help={!this.state.typeValid ? "This is not a valid VSX variable star type, but you can still submit it" : ""}
                           hasFeedback>
                    {getFieldDecorator('type', {
                        initialValue: this.props.initialValue
                    })(
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
            </Fragment>
        );
    }
}

export class CoordinatesFormItem extends Component {
    constructor(props) {
        super(props);
        this.coordinatesRaRegexp = /^((\d*(\.\d+)?)|((\d{1,2})[\s:](\d{1,2})[\s:](\d{0,2}(\.\d+)?)))$/;
        this.coordinatesDecRegexp = /^(([+-]?\d*(\.\d+)?)|(([+-]?\d{1,2})[\s:](\d{1,2})[\s:](\d{0,2}(\.\d+)?)))$/;
    }

    validateDecRange = (rule, value, callback) => {
        callback();
    };

    validateRaRange = (rule, value, callback) => {
        callback();
    };

    render() {
        const {getFieldDecorator} = this.props.form;

        return (
            <MyFormItem label="Coordinates" required={this.props.required}>
                <Col span={12}>
                    <Form.Item>
                        {getFieldDecorator('coordinates.ra', {
                            rules: [{
                                pattern: this.coordinatesRaRegexp,
                                message: 'The input is not valid right ascension!',
                            }, {
                                required: true, message: 'Please input the right ascension!',
                            }, {
                                validator: this.validateRaRange
                            }],
                            initialValue: this.props.initialValue ? this.props.initialValue.ra : null
                        })(
                            <Input placeholder="Right ascension" onBlur={this.props.onBlur}
                                   style={{
                                       borderTopRightRadius: 0,
                                       borderBottomRightRadius: 0
                                   }}/>
                        )}
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item>
                        {getFieldDecorator('coordinates.dec', {
                            rules: [{
                                pattern: this.coordinatesDecRegexp,
                                message: 'The input is not valid declination!',
                            }, {
                                required: true, message: 'Please input the declination!',
                            }, {
                                validator: this.validateDecRange
                            }],
                            initialValue: this.props.initialValue ? this.props.initialValue.dec : null
                        })(
                            <Input placeholder="Declination" onBlur={this.props.onBlur}
                                   style={{borderBottomLeftRadius: 0, borderTopLeftRadius: 0}}/>
                        )}
                    </Form.Item>
                </Col>
            </MyFormItem>
        );
    }
}

export class CrossIdsFormItem extends Component {
    constructor(props) {
        super(props);
        this.crossIdRegexp = /((UCAC4\s\d{3}-\d{6})|(USNO-B[12]\.0\s\d{4}-\d{7}))/;
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

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;

        getFieldDecorator('crossidKeys', {initialValue: [0]});
        const crossIds = getFieldValue('crossidKeys');

        const crossIdFormItems = crossIds.map((k, index) => {
            return (
                <MyFormItem
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
                                this.props.onBlur()
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
                </MyFormItem>
            )
        });
        return (
            <Fragment>
                {crossIdFormItems}
                <MyFormItem>
                    <Button type="dashed" onClick={this.addCrossId} style={{width: "90%"}}>
                        <Icon type="plus"/> Add Cross id
                    </Button>
                </MyFormItem>
            </Fragment>
        );
    }
}

export class NumberFormItem extends Component {
    render() {
        const {getFieldDecorator} = this.props.form;
        const inputNumberAttrs = {style: {width: "100%"}};
        if (this.props.min != null) {
            inputNumberAttrs["min"] = this.props.min;
        }
        if (this.props.max != null) {
            inputNumberAttrs["max"] = this.props.max;
        }
        return (
            <MyFormItem label={this.props.label} required={this.props.required}>
                {getFieldDecorator(this.props.field, {
                    rules: [{
                        type: "number", message: "The input is not a valid number"
                    }],
                    initialValue: this.props.initialValue
                })(
                    <InputNumber {...inputNumberAttrs}/>
                )}
            </MyFormItem>
        );
    }
}

export class IdNameSelectFormItem extends Component {
    static defaultProps = {
        optionName: (o) => o.name
    };

    getInitialValue = () => {
        if (this.props.mode === "multiple") {
            if (this.props.initialValue != null) {
                return this.props.initialValue.map(v => "" + v);
            }
            return [];
        } else {
            if (this.props.initialValue != null) {
                return "" + this.props.initialValue;
            }
            return null;
        }
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        const initialValue = this.getInitialValue();

        return (
            <MyFormItem label={this.props.label} required={this.props.required}>
                <Spin spinning={this.props.loading}>
                    {getFieldDecorator(this.props.field, {
                        rules: [
                            {required: this.props.required, message: "Please select something"}
                        ], initialValue: initialValue
                    })(
                        <Select
                            mode={this.props.mode || "single"}
                            allowClear={!this.props.required}
                            showSearch
                            placeholder={this.props.placeholder}
                            optionFilterProp="children"
                        >
                            {this.props.options.map(o => {
                                return (
                                    <Select.Option key={o.id}>{this.props.optionName(o)}</Select.Option>
                                )
                            })}
                        </Select>
                    )}
                </Spin>
            </MyFormItem>
        );
    }
}

export class TextAreaFormItem extends Component {
    render() {
        const {getFieldDecorator} = this.props.form;

        return (
            <MyFormItem label={this.props.label} required={this.props.required}>
                {getFieldDecorator(this.props.field, {
                    initialValue: this.props.initialValue,
                    rules: [
                        {required: this.props.required, message: "This field is required"}
                    ]
                })(
                    <Input.TextArea/>
                )}
            </MyFormItem>
        );
    }
}

export class InputFormItem extends Component {
    render() {
        const {getFieldDecorator} = this.props.form;

        return (
            <MyFormItem label={this.props.label} required={this.props.required}>
                {getFieldDecorator(this.props.field, {
                    initialValue: this.props.initialValue,
                    rules: [
                        {required: this.props.required, message: "This field is required"}
                    ]
                })(
                    <Input/>
                )}
            </MyFormItem>
        )
    }
}

export class CascaderFormItem extends Component {
    render() {
        const {getFieldDecorator} = this.props.form;

        return (
            <MyFormItem label={this.props.label} required={this.props.required}>
                {getFieldDecorator(this.props.field, {
                    initialValue: this.props.initialValue,
                    rules: [
                        {required: this.props.required, message: "This field is required"}
                    ]
                })(
                    <Cascader options={this.props.options} fieldNames={this.props.fieldNames}/>
                )}
            </MyFormItem>
        );
    }
}

export class PublicationEntryFormItem extends Component {
    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <Row gutter={12}>
                <Col span={10}>
                    <Form.Item style={{marginBottom: 0}} required={true}>
                        {getFieldDecorator(`publicationEntries[${this.props.itemKey}].volumeId`, {
                            initialValue: this.props.initialValue ? [this.props.initialValue.publication.id, this.props.initialValue.volume.id] : null,
                            rules: [
                                {required: true, message: "This field is required"}
                            ]
                        })(
                            <Cascader options={this.props.publications}
                                      fieldNames={{children: 'volumes', value: 'id', label: 'name'}}/>
                        )}
                    </Form.Item>
                </Col>
                <Col span={10}>
                    <Form.Item style={{marginBottom: 0}}>
                        {getFieldDecorator(`publicationEntries[${this.props.itemKey}].page`, {
                            initialValue: this.props.initialValue ? this.props.initialValue.page : null
                        })(
                            <Input/>
                        )}
                    </Form.Item>
                </Col>
                <Col span={4}>
                    <Button style={{marginBottom: 0}} type="danger"
                            onClick={this.props.onRemove}>Remove</Button>
                </Col>
            </Row>
        );
    }
}


export class PublicationEntriesFormItem extends Component {
    static defaultProps = {
        initialValue: []
    };

    constructor(props) {
        super(props);
        this.state = this.getDerivedState(props.initialValue)
    }

    getDerivedState = (initialValue) => {
        const keys = [];
        const initialValues = {};
        initialValue.forEach((value, i) => {
            keys.push(i);
            initialValues[i] = value;
        });
        return {keys, initialValues}
    };

    addKey = () => {
        const {keys} = this.state;
        const nextKeys = keys.length === 0 ? [0] : keys.concat(keys[keys.length - 1] + 1);
        this.setState({
            ...this.state,
            keys: nextKeys
        });
    };

    removeKey = (k) => {
        const {keys, initialValues} = this.state;
        delete initialValues[k];
        this.setState({
            initialValues: initialValues,
            keys: keys.filter(key => key !== k)
        });
    };

    render() {
        const {keys, initialValues} = this.state;
        return (
            <div>
                <h3 style={{marginBottom: "1em"}}>Publication entries <Button onClick={this.addKey} size="small"
                                                                              type="primary">Add</Button></h3>
                <Row gutter={12}>
                    <Col span={10}>
                        Publication
                    </Col>
                    <Col span={10}>
                        Page
                    </Col>
                </Row>
                <MinimaPublicationsConsumer>
                    {({publications, loading: publicationsLoading}) =>
                        keys.map(key =>
                            (
                                <PublicationEntryFormItem form={this.props.form} key={key} itemKey={key}
                                                          publications={publications}
                                                          onRemove={() => this.removeKey(key)}
                                                          initialValue={initialValues[key]}/>
                            )
                        )
                    }
                </MinimaPublicationsConsumer>
            </div>
        );
    }
}
