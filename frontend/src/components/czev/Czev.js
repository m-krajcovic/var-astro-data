import React, {Component} from "react";

import {Button, Col, Layout, Row} from 'antd';
import {BASE_URL} from "../../api-endpoint";
import axios from "axios";
import {Link, Route, Switch} from "react-router-dom";

import "./Czev.css";
import {PathBreadCrumbs} from "../common/PathBreadCrumbs";
import CzevAdmin from "./admin/CzevAdmin";
import CzevUser from "./user/CzevUser";
import {AuthConsumer, OnlyAuth} from "../AuthContext";
import {CzevStarDetail} from "./CzevStarDetail";
import {CzevStarEdit} from "./CzevStarEdit";
import {CzevCatalogue} from "./CzevCatalogue";
import {CzevNewStar} from "./CzevNewStar";

const breadcrumbNameMap = {
    "/czev": "CzeV Catalogue",
    "/czev/new": "New variable star",
    "/czev/user": null,
    "/czev/user/drafts": "Your Drafts",
    "/czev/admin": "Admin",
    "/czev/admin/drafts": "Drafts"
};

export default class Czev extends Component {
    constructor(props) {
        super(props);
        this.state = {
            types: [],
            constellations: [],
            filterBands: [],
            observers: [],
            loading: false,
            reload: this.loadEntities
        }
    }

    componentDidMount() {
        this.loadEntities();
    }

    loadEntities = () => {
        this.setState({...this.state, loading: true});
        const c = axios.get(BASE_URL + "/czev/constellations");
        const t = axios.get(BASE_URL + "/czev/types");
        const fb = axios.get(BASE_URL + "/czev/filterBands");
        const o = axios.get(BASE_URL + "/czev/observers");
        Promise.all([c, t, fb, o])
            .then(result => {
                this.setState({
                    ...this.state,
                    loading: false,
                    constellations: result[0].data,
                    types: new Set(result[1].data),
                    filterBands: result[2].data,
                    observers: result[3].data
                })
            })
            .catch(e => {
                // TODO
                console.error("Failed to fetch entities");
            });
    };

    render() {
        return (
            <Layout.Content style={{margin: "24px 24px 0"}}>
                <Row>
                    <Col span={12}>
                        <PathBreadCrumbs breadcrumbNameMap={breadcrumbNameMap}/>
                    </Col><Col span={12} style={{textAlign: "right"}}>
                    <OnlyAuth default={(<span style={{opacity: 0.6}}>Log in to sumit new variable star</span>)}>
                        {this.props.location.pathname !== "/czev/new" && (
                            <Button type="primary" size="small"><Link to="/czev/new">Submit new variable
                                star</Link></Button>
                        )}
                    </OnlyAuth></Col>
                </Row>
                <AuthConsumer>
                    {({isAuth, isAdmin}) => {
                        return (
                            <Switch>
                                {isAdmin && (<Route path="/czev/admin"
                                                    render={props => (
                                                        <CzevAdmin {...props} entities={{...this.state}}/>)}/>)}
                                {isAuth && (<Route path="/czev/user"
                                                   render={props => (
                                                       <CzevUser {...props} entities={{...this.state}}/>)}/>)}
                                {isAuth && (<Route path="/czev/new"
                                                   render={props => (
                                                       <CzevNewStar {...props} entities={{...this.state}}/>)}/>)}
                                {isAuth && (<Route path="/czev/:id/edit"
                                                   render={props => (<CzevStarEdit {...props}
                                                                                       entities={{...this.state}}/>)}/>)}
                                <Route path="/czev/:id"
                                       render={props => (<CzevStarDetail {...props} entities={{...this.state}}/>)}/>
                                <Route path="/czev"
                                       render={props => (<CzevCatalogue {...props} entities={{...this.state}}/>)}/>
                            </Switch>)
                    }}
                </AuthConsumer>
            </Layout.Content>
        )
    }
};



// table - filters
// show logs of star changes
