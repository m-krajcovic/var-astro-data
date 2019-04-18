import React, {Component} from "react";
import {AutoSizer, List as VirtualizedList} from "react-virtualized";
import {List} from "antd";
import {Link} from "react-router-dom";
import {Icon, Popover} from "antd";
import {PredictionsMinimaGraph} from "./PredictionsMinimaGraph";
import {CoordinateWrapper} from "../common/CoordinateWrapper";
import {coordinatesToStringDec, coordinatesToStringRa} from "../ocgate/StarDetail";

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
                                            let style = {};
                                            if (!col.noStyle) {
                                                style = {padding: "0 16px", flex: `0 0 ${col.width}px`};
                                            }
                                            return (
                                                <span {...itemProps} key={i} style={style}>
                                                    {body}
                                                </span>
                                            )
                                        })}
                                        {/*<span style={{flex: "0 0 200px", padding: "0 16px"}}>*/}
                                            {/*<Link*/}
                                                {/*to={"/oc/" + nameSplit[1] + "/" + nameSplit[0]}>{record.name}</Link>*/}
                                            {/*<Popover*/}
                                                {/*overlayClassName="popover-minima-graph"*/}
                                                {/*content={(<PredictionsMinimaGraph id={record.id}*/}
                                                                                  {/*kind={record.kind}/>)}*/}
                                            {/*>*/}
                                                {/*<Icon*/}
                                                    {/*style={{*/}
                                                        {/*verticalAlign: "-0.25em",*/}
                                                        {/*paddingLeft: 2*/}
                                                    {/*}}*/}
                                                    {/*type="dot-chart"*/}
                                                    {/*className="clickable-icon"/>*/}
                                            {/*</Popover>*/}
                                        {/*</span>*/}
                                        {/*<span style={{*/}
                                            {/*flex: "0 0 60px",*/}
                                            {/*padding: "0 16px"*/}
                                        {/*}}>{record.kind}</span>*/}
                                        {/*<span style={{flex: "0 0 70px", padding: "0 16px"}}*/}
                                              {/*title={`${record.minimumDateTime} (${record.minimum})`}>{date.format("HH:mm")}</span>*/}
                                        {/*<span style={{*/}
                                            {/*flex: "0 0 90px",*/}
                                            {/*padding: "0 16px"*/}
                                        {/*}}>{record.points}</span>*/}
                                        {/*<span*/}
                                            {/*style={{*/}
                                                {/*flex: "0 0 70px",*/}
                                                {/*padding: "0 16px"*/}
                                            {/*}}>{Math.round(record.altitude)}&deg;</span>*/}
                                        {/*<span style={{*/}
                                            {/*flex: "0 0 70px",*/}
                                            {/*padding: "0 16px"*/}
                                        {/*}}>{record.azimuth}</span>*/}
                                        {/*<span style={{*/}
                                            {/*flex: "0 0 70px",*/}
                                            {/*padding: "0 16px"*/}
                                        {/*}}>{record.minimaLength}</span>*/}
                                        {/*<span style={{*/}
                                            {/*flex: "0 0 230px",*/}
                                            {/*padding: "0 16px"*/}
                                        {/*}}>*/}
                                            {/*<CoordinateWrapper size="small" value={record.coordinates.raString}/>&nbsp;*/}
                                            {/*<CoordinateWrapper size="small" value={record.coordinates.decString}/>*/}
                                        {/*</span>*/}
                                        {/*<span*/}
                                            {/*style={{}}>{record.magnitudes.map(m => `${m.max}-${m.min} (${m.filter})`).join(", ")}</span>*/}
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
