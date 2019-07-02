import React, {Component} from "react";
import {Tabs} from "antd";
import {CzevStarDraftSingleNewStar} from "./CzevStarDraftSingleNewStar";
import {CzevStarDraftCsvImport} from "./CzevStarDraftCsvImport";

export class CzevNewStar extends Component {
    render() {
        return (
            <div className="card-container">
                <Tabs type="card">
                    <Tabs.TabPane tab="Single" key={1}>
                        <CzevStarDraftSingleNewStar entities={this.props.entities}/>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Import multiple" key={2}>
                        <CzevStarDraftCsvImport/>
                    </Tabs.TabPane>
                </Tabs>
            </div>
        )
    }
}
