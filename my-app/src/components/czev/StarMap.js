import React, {Component, Fragment} from "react";
import {Button} from "antd";

export default class StarMap extends Component {
    static defaultProps = {
        fov: 0.2,
        onCopy: () => {
        }
    };

    constructor(props) {
        super(props);
        this.state = {selectedObject: null};
        this.id = new Date().getTime();
    }

    componentDidUpdate(prevProps) {
        if (this.props.coordinates.ra !== prevProps.coordinates.ra || this.props.coordinates.dec !== prevProps.coordinates.dec) {
            const coo = new window.Coo();
            coo.parse(`${this.props.coordinates.ra} ${this.props.coordinates.dec}`);
            this.aladin.gotoRaDec(coo.lon, coo.lat);
            this.aladin.setFov(this.props.fov);
            this.aladin.removeLayers();
            if (this.props.catalog) {
                this.aladin.addCatalog(window.A.catalogFromVizieR('I/322A/out', {
                    ra: coo.lon,
                    dec: coo.lat
                }, this.props.fov * 3, {onClick: 'showTable', color: '#1890ff'}));
            }
            const catalog = window.A.catalog({name: 'Original position', shape: 'cross', sourceSize: 20, color: '#52c41a'});
            catalog.addSources([window.A.source(coo.lon, coo.lat)]);
            this.aladin.addCatalog(catalog);
        }
    }

    componentDidMount() {
        const coo = new window.Coo();
        coo.parse(`${this.props.coordinates.ra} ${this.props.coordinates.dec}`);
        this.aladin = window.A.aladin(`#${this.id}`, {
            target: `${coo.lon} ${coo.lat}`,
            survey: "P/DSS2/color",
            fov: this.props.fov
        });
        this.aladin.on('objectClicked', (object) => {
            if (object && object.data) {
                this.setState({selectedObject: object});
            }
        });
        if (this.props.catalog) {
            this.aladin.addCatalog(window.A.catalogFromVizieR('I/322A/out', {
                ra: coo.lon,
                dec: coo.lat
            }, this.props.fov * 3, {onClick: 'showTable', color: '#1890ff'}));
        }
        const catalog = window.A.catalog({name: 'Original position', shape: 'cross', sourceSize: 20, color: '#52c41a'});
        catalog.addSources([window.A.source(coo.lon, coo.lat)]);
        this.aladin.addCatalog(catalog);
    }

    parseSelectedObject = () => {
        const obj = this.state.selectedObject.data;
        const magnitudes = {};
        if (obj.Vmag) {
            magnitudes["V"] = obj.Vmag;
        }
        if (obj.Jmag) {
            magnitudes["J"] = obj.Jmag;
        }
        if (obj.Kmag) {
            magnitudes["K"] = obj.Kmag;
        }
        return {
            coordinates: {
                ra: parseFloat(obj.RAJ2000),
                dec: parseFloat(obj.DEJ2000)
            },
            identifier: obj.UCAC4,
            magnitudes: magnitudes
        }
    };

    render() {
        return (
            <Fragment>
                <div style={{width: "100%", paddingTop: "100%", position: "relative"}}>
                    <div id={this.id} style={{width: "100%", height: "100%", position: "absolute", top: 0, left: 0}}/>
                </div>
                {this.props.catalog &&
                <Button block disabled={this.state.selectedObject == null} style={{marginTop: 8}} icon="copy"
                        type="dashed" onClick={() => this.props.onCopy(this.parseSelectedObject())}>Copy to
                    form</Button>
                }
            </Fragment>
        )
    }
}
