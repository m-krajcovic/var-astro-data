import React, {Component} from 'react';
import {Form, Icon, message, Upload} from "antd";

export class AdditionalFilesUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: []
        }
    }

    render() {
        const props = {
            action: '',
            onRemove: (file) => {
                const {files} = this.state;
                const index = files.indexOf(file);
                const newFileList = files.slice();
                newFileList.splice(index, 1);
                if (this.props.onChange) {
                    this.props.onChange(newFileList);
                }
                this.setState((state) => {
                    return {
                        ...state,
                        files: newFileList,
                    };
                });
            },
            beforeUpload: (file) => {
                const isLt2MB = file.size / 1024 < 2048;
                if (!isLt2MB) {
                    message.error('File must be smaller than 2MB!');
                } else {
                    const {files} = this.state;
                    files.push(file);
                    if (this.props.onChange) {
                        this.props.onChange(files);
                    }
                    this.setState((state) => ({
                        ...state,
                        files: files,
                    }));
                }
                return false
            },
            fileList: this.state.files,
            multiple: true
        };

        return (
            <Form.Item
                wrapperCol={{
                    xs: {span: 24},
                    sm: {span: 18},
                }}
                labelCol={{
                    xs: {span: 24},
                    sm: {span: 6}
                }}
                label="Additional files">
                <Upload.Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                        <Icon type="inbox"/>
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                </Upload.Dragger>
            </Form.Item>
        );
    }
}
