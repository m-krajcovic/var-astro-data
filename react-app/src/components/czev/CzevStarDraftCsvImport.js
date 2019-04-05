import React, {Component, Fragment} from "react";
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";
import {Alert, Button, Col, Icon, message, Row, Upload, List} from "antd";

export class CzevStarDraftCsvImport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fileList: [],
            uploading: false,
            importResult: null
        }
    }

    handleUpload = () => {
        const {fileList} = this.state;
        const formData = new FormData();
        formData.set('file', fileList[0]);

        this.setState({
            uploading: true,
        });

        axios.post(BASE_URL + "/czev/drafts/import", formData)
            .then(result => {
                this.setState({...this.state, fileList: [], uploading: false, importResult: result.data});
            });
    };

    render() {
        const {uploading} = this.state;
        const props = {
            action: '',
            onRemove: (file) => {
                this.setState(({fileList}) => {
                    const index = fileList.indexOf(file);
                    const newFileList = fileList.slice();
                    newFileList.splice(index, 1);
                    return {
                        fileList: newFileList,
                    };
                });
            },
            beforeUpload: (file) => {
                const isLt256KB = file.size / 1024 < 256;
                if (!isLt256KB) {
                    message.error('File must be smaller than 256KB!');
                } else {
                    this.setState(({fileList}) => ({
                        fileList: [file],
                    }));
                }
                return false
            },
            fileList: this.state.fileList,
            multiple: false
        };

        return (
            <Fragment>
                <Row>
                    <Col span={24}>
                        <p>If you want to import multiple variable star discoveries at once, you can upload CSV file
                            containing.</p>
                        <p>Keep in mind following rules when importing</p>
                        <ul style={{listStyleType: "circle", paddingLeft: 40}}>
                            <li>Follow the order of columns</li>
                            <li>Don't include csv header</li>
                            <li>Don't skip any column, number of columns must be 12 for every record</li>
                            <li>Columns marked with * are required</li>
                        </ul>
                        <pre>
                        *RA (J2000), *DEC (J2000), *Cross-ids (split with ';'), *Constellation (abbreviation), *Discoverers (abbreviations, split by ';'), *Year, Type, Amplitude, Filter Band, Epoch, Period, Note
                    </pre>
                    </Col>
                </Row>
                <Row>
                    <Col xs={{span: 12, offset: 6}}>
                        <Upload.Dragger {...props}
                        >
                            <p className="ant-upload-drag-icon">
                                <Icon type="inbox"/>
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        </Upload.Dragger>
                        <Button
                            style={{marginTop: 12}}
                            className="upload-demo-start"
                            type="primary"
                            onClick={this.handleUpload}
                            disabled={this.state.fileList.length === 0}
                            loading={uploading}
                        >{uploading ? 'Uploading' : 'Start Import'}</Button>
                        {this.state.importResult !== null &&
                        (
                            <div>
                                {this.state.importResult.parsingErrors.length > 0 ? (
                                    <Alert
                                        style={{marginTop: 12}}
                                        showIcon
                                        type="error"
                                        message="There were errors importing your file"
                                        description={(
                                            <List
                                                size="small"
                                                dataSource={this.state.importResult.parsingErrors}
                                                renderItem={item => (
                                                    <List.Item key={item.recordNumber}>
                                                        <span>Line number {item.recordNumber}: </span>
                                                        <ul style={{margin: 0}}>
                                                            {item.messages.map((m, i) => (
                                                                <li key={i}>{m}</li>
                                                            ))}
                                                        </ul>
                                                    </List.Item>
                                                )}/>
                                        )}
                                    />
                                ) : (
                                    <Alert
                                        style={{marginTop: 12}}
                                        showIcon
                                        type="success"
                                        message="Import finished successfully"
                                        description={`Imported ${this.state.importResult.importedCount} discoveries`}
                                    />
                                )}
                            </div>
                        )}
                    </Col>
                </Row>
            </Fragment>
        )
    }

}
