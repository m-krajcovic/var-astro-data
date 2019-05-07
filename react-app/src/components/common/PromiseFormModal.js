import React, {Component} from "react";
import {Form, Modal, notification} from "antd";
import axios from "axios";

export const PromiseFormModal = Form.create()(
    class extends Component {
        static defaultProps = {
            valuesFix: (values) => values,
            successMessage: "Success",
            title: "",
            visible: false,
            onCancel: () => {},
            onOk: (result) => {},
            onError: (reason) => {},
            render: (form) => (<Form/>),
            promise: axios.post
        };

        constructor(props) {
            super(props);
            this.state = {loading: false};
        }

        handleOk = () => {
            this.props.form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                    this.setState({...this.state, loading: true});
                    const fixed = this.props.valuesFix(values);
                    let url = this.props.url;
                    if (url instanceof Function) {
                        url = url()
                    }
                    this.props.promise(url, fixed)
                        .then(result => {
                            notification.success({
                                message: this.props.successMessage
                            });
                            this.setState({...this.state, loading: false});
                            this.props.onOk(result);
                        })
                        .catch(reason => {
                            this.props.onError(reason)
                        });
                }
            });
        };

        render() {
            return (
                <Modal
                    visible={this.props.visible}
                    title={this.props.title}
                    okText="Submit"
                    destroyOnClose={true}
                    onCancel={this.props.onCancel}
                    onOk={this.handleOk}
                    confirmLoading={this.state.loading}
                >
                    {this.props.render(this.props.form)}
                </Modal>
            );
        }
    }
);
