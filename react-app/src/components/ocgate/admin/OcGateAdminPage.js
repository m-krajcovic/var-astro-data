import React, {Component} from "react";
import {AuthConsumer} from "../../AuthContext";
import {Route, Switch} from "react-router-dom";
// import axios from "axios";
import {OcGateAdminStarsListPage} from "./OcGateAdminStarsListPage";
import {OcGateAdminStarDetailPage} from "./OcGateAdminStarDetailPage";
import {OcGateAdminStarNewPage} from "./OcGateAdminStarNewPage";
import {EntitiesProvider} from "../../common/EntitiesContext";
import {MinimaPublicationsListPage} from "./MinimaPublicationsListPage";

export default class OcGateAdminPage extends Component {
    render() {
        return (
            <EntitiesProvider>
                <AuthConsumer>
                    {({isAuth, isAdmin}) => {
                        return (
                            <Switch>
                                {/*{isAdmin && (<Route path="/ocgate/admin"*/}
                                {/*render={props => (*/}
                                {/*/!*<CzevAdmin {...props} entities={{...this.state}}/>*!/*/}
                                {/*)}/>)}*/}
                                <Route path="/admin/ocgate/stars/new" component={OcGateAdminStarNewPage}/>
                                <Route path="/admin/ocgate/stars/:id" component={OcGateAdminStarDetailPage}/>
                                <Route path="/admin/ocgate/stars" component={OcGateAdminStarsListPage}/>
                                {/*<Route path="/admin/ocgate/publications/new" component={OcGateAdminStarsListPage}/>*/}
                                {/*<Route path="/admin/ocgate/publications/:id" component={OcGateAdminStarsListPage}/>*/}
                                <Route path="/admin/ocgate/publications" component={MinimaPublicationsListPage}/>
                                <Route path="/admin/ocgate" component={OcGateAdminLandingPage}/>
                            </Switch>)
                    }}
                </AuthConsumer>
            </EntitiesProvider>
        )
    }
}

class OcGateAdminLandingPage extends Component {
    render() {
        return (
            <span>Hello from the oc gate admin page
            </span>
        );
    }
}

// TODO
// UPDATE MINIMA IN BATCH/FILTER
