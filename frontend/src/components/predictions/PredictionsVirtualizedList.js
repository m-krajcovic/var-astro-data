import React, {Component} from "react";
import {AutoSizer, List as VirtualizedList} from "react-virtualized";
import {List} from "antd";

export class PredictionsVirtualizedList extends Component {
// TODO: changing filter doesnt update element id for graph ! so there is wrong graph for the row
    render() {
        let predictions = this.props.predictions;
        return (
            <AutoSizer>
                {({width, height}) => (
                    <VirtualizedList
                        // className={styles.List}
                        height={height}
                        rowCount={predictions.length}
                        rowHeight={30}
                        rowRenderer={({index, key, style}) => {
                            const record = predictions[index];
                            return (
                                <List.Item key={key} style={style}>
                                    <div style={{
                                        display: 'flex',
                                        width: "100%",
                                        flexWrap: "nowrap"
                                    }}>
                                        {this.props.columns.map((col, i) => {
                                            let body = record[col.dataIndex];
                                            if (col.render) {
                                                body = col.render(record);
                                            }
                                            let itemProps = col.itemProps ? col.itemProps(record) : {};
                                            let style = {paddingLeft: "8px"};
                                            if (!col.noStyle) {
                                                style['flex'] = `0 0 ${col.width}px`;
                                            }
                                            if (col.customStyle) {
                                                style = {...style, ...col.customStyle}
                                            }
                                            return (
                                                <span {...itemProps} key={i} style={style}>
                                                    {body}
                                                </span>
                                            )
                                        })}
                                    </div>
                                </List.Item>
                            )
                        }}
                        width={width}
                    />

                )}
            </AutoSizer>
        )
    }
}
