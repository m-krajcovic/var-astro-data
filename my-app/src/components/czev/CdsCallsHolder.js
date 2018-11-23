import React, {Component, Fragment} from "react";
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";

export class CdsCallsHolder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            coordsInfoParams: {},
            coordsInfoLoading: false,
            coordsInfoResult: null,

            nameInfoParams: {},
            nameInfoLoading: false,
            nameInfoResult: null,
        }
    }

    loadByName = name => {
        if (name) {
            if (this.state.nameInfoParams !== name) {
                this.setState({...this.state, nameInfoParams: name, nameInfoLoading: true});
                axios.get(BASE_URL + "/czev/cds/all", {
                    params: {
                        name: name,
                    }
                }).then(result => {
                    if (this.state.nameInfoParams === name) {
                        this.setState({...this.state, nameInfoResult: result.data, nameInfoLoading: false})
                    }
                })
            }
        }
    };

    loadByCoordinates = coords => {
        if (coords && coords.ra != null && coords.dec != null) {
            if (coords.ra !== this.state.coordsInfoParams.ra || coords.dec !== this.state.coordsInfoParams.dec) {
                this.setState({...this.state, coordsInfoParams: coords, coordsInfoLoading: true});
                axios.get(BASE_URL + "/czev/cds/all", {
                    params: {
                        ra: coords.ra,
                        dec: coords.dec
                    }
                }).then(result => {
                    this.setState({...this.state, coordsInfoResult: result.data, coordsInfoLoading: false})
                })
            }
        }
    };

    render() {
        const {children} = this.props;
        const childrenWithProps = React.Children.map(children, child =>
            React.cloneElement(child, {
                cds: {
                    ...this.state,
                    loadByName: this.loadByName,
                    loadByCoordinates: this.loadByCoordinates
                }
            })
        );

        return <Fragment>{childrenWithProps}</Fragment>

    }
}
