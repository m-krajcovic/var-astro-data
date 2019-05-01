import React, {Component} from 'react';
import {BASE_URL} from "../../api-endpoint";
import {Avatar, Form, List} from "antd";
import {IconText} from "../common/IconText";

const WillBeRemovedSpan = () => {
    return (
        <span style={{
            position: "absolute",
            top: "calc(50% - 10px)",
            textAlign: "center",
            left: 0, right: 0,
            color: "#ff483e"
        }}>THIS FILE WILL BE REMOVED ON SUBMIT</span>
    )
};

export class UploadedFilesListFormItem extends Component {
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
        return (
            <Form.Item {...formItemLayout} label="Uploaded files">
                <UploadedFilesList onChange={this.props.onChange} files={this.props.files} disableActions={this.props.disableActions}/>
            </Form.Item>
        )
    }
}

export class UploadedFilesList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deleted: new Set()
        }
    }

    render() {

        if (this.props.files) {
            return (
                <List dataSource={this.props.files} className="uploaded-files_list" renderItem={file => {
                    const inDeleted = this.state.deleted.has(file.id);
                    return (
                        <List.Item key={file.id}
                                   actions={
                                       this.props.disableActions ? [] : (inDeleted ?
                                           [<IconText type="undo" text="Undo"
                                                      onClick={() => {
                                                          const {deleted} = this.state;
                                                          deleted.delete(file.id);
                                                          this.setState({...this.state, deleted});
                                                          if (this.props.onChange) {
                                                              this.props.onChange(Array.from(deleted));
                                                          }
                                                      }}/>] :
                                           [<IconText type="delete"
                                                      text="Remove"
                                                      onClick={() => {
                                                          const deleted = this.state.deleted.add(file.id);
                                                          this.setState({
                                                              ...this.state,
                                                              deleted: deleted
                                                          });
                                                          if (this.props.onChange) {
                                                              this.props.onChange(Array.from(deleted));
                                                          }
                                                      }}/>])}
                        >
                            {inDeleted && <WillBeRemovedSpan/>}
                            <a href={`${BASE_URL}/czev/files/${file.id}`} target="_blank" rel="noopener noreferrer" style={{
                                opacity: inDeleted ? 0.2 : 1
                            }}>
                                <List.Item.Meta
                                    avatar={
                                        file.fileType.startsWith("image") ?
                                            <Avatar
                                                shape="square"
                                                size={64}
                                                src={`${BASE_URL}/czev/files/${file.id}`}/> :
                                            <Avatar shape="square" size={64} icon="file"/>
                                    }
                                    title={file.fileName}
                                    description={file.fileType}
                                >
                                </List.Item.Meta>
                            </a>
                        </List.Item>
                    )
                }}/>
            )
        } else {
            return null
        }
    }
}
