import React, {Component} from "react";
import {Layout} from "antd/lib/layout";
import {Route, Switch} from "react-router-dom";

export default class CzevUser extends Component {
    render() {
        return (
            <Layout.Content style={{margin: "24px 24px 0"}}>
                <Switch>
                    <Route path="/czev/user/drafts" component={CzevUserDrafts}/>
                    <Route path="/czev/user/drafts/:id" component={CzevUserDraftDetail}/>
                </Switch>
            </Layout.Content>
        )
    }
}

export class CzevUserDrafts extends Component {
    render() {
        return (
            <div></div>
        )
    }
}

export class CzevUserDraftDetail extends Component {
    render() {
        return (
            <div></div>
        )
    }
}
