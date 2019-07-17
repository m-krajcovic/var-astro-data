import React, {Component} from "react";
import {Route, Switch} from "react-router-dom";
import OcGateAdminPage from "../ocgate/admin/OcGateAdminPage";
import EmptyPage from "../common/EmptyPage";

export default class AdminPage extends Component {
    render() {
        return (
            <Switch>
                <Route path="/admin/ocgate" component={OcGateAdminPage}/>
                <Route path="/admin" component={AdminLandingPage}/>
            </Switch>
        )
    }
}

class AdminLandingPage extends Component {
    render() {
        return (
            <EmptyPage/>
        );
    }
}
