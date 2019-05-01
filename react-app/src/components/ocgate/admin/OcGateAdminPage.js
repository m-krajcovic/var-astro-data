import React, {Component} from "react";
import {AuthConsumer} from "../../AuthContext";
import {Route, Switch} from "react-router-dom";
// import axios from "axios";
import {OcGateAdminStarsListPage} from "./OcGateAdminStarsListPage";
import {OcGateAdminStarDetailPage} from "./OcGateAdminStarDetailPage";
import {OcGateAdminStarNewPage} from "./OcGateAdminStarNewPage";

export default class OcGateAdminPage extends Component {
    render() {
        return (
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
                            <Route path="/admin/ocgate" component={OcGateAdminLandingPage}/>
                        </Switch>)
                }}
            </AuthConsumer>)
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

// LIST STARS

// STAR DETAILS
//    STAR INFO
//    BRIGHTNESS
//    ELEMENTS
//        MINIMA

// LIST PUBLICATIONS

// NEW STAR PAGE
//    GENERIC INFO
//    NEW BRIGHTNESS COMPONENT
//    NEW ELEMENT COMPONENT

// NEW MINIMA PAGE
//    ADD PUBLICATION COMPONENT

// NEW BATCH MINIMA PAGE

// NEW PUBLICATION PAGE


// UPDATE STAR PAGE
//    UPDATE GENERIC
//    UPDATE BRIGHTNESS
//    UPDATE ELEMENT

// UPDATE MINIMA PAGE

// UPDATE PUBLICATION PAGE

// TODO
// UPDATE MINIMA IN BATCH/FILTER
