import React, {Component} from "react";
import {AutoSizer, List as VirtualizedList} from "react-virtualized";
import {List} from "antd";

export class PredictionsVirtualizedList extends Component {

    render() {
        let predictions = this.props.predictions;
        if (this.props.filters) {
            if (this.props.filters.name) {
                this.props.filters.name.forEach(value => {
                    predictions = predictions.filter(p => p.name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
                });
            }
            if (this.props.filters.points) {
                this.props.filters.points.forEach(value => {
                    predictions = predictions.filter(p => p.points === null || p.points >= value);
                });
            }
            if (this.props.filters.altitude) {
                this.props.filters.altitude.forEach(value => {
                    predictions = predictions.filter(p => !(value.max && p.altitude > value.max) && !(value.min && p.altitude < value.min))

                });
            }
            if (this.props.filters.azimuth) {
                predictions = predictions.filter(p => this.props.filters.azimuth.indexOf(p.azimuth) !== -1);
            }
            if (this.props.filters.magnitudes) {
                this.props.filters.magnitudes.forEach(value => {
                    predictions = predictions.filter(p => {
                        for (let i = 0; i < p.magnitudes.length; i++) {
                            const m = p.magnitudes[i];
                            if (!(value.max && m.min > value.max) && !(value.min && m.max < value.min)) {
                                return true;
                            }
                        }
                        return false;
                    });
                });
            }
        }
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
