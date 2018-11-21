import React, {Component} from "react";
import {Route, Switch} from "react-router-dom";
import {Layout} from "antd";

export default class CzevAdmin extends Component {
    render() {
        return (
            <Layout.Content style={{margin: "24px 24px 0"}}>
                <Switch>
                    <Route path="/czev/admin/drafts" component={CzevAdminDrafts}/>
                    <Route path="/czev/admin/drafts/:id" component={CzevAdminDraftDetail}/>
                </Switch>
            </Layout.Content>
        )
    }
}

export class CzevAdminDrafts extends Component {
    render() {
        return (
            <div></div>
        )
    }
}

export class CzevAdminDraftDetail extends Component {
    render() {
        return (
            <div></div>
        )
    }
}
