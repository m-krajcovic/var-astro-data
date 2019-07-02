import React, {Component} from "react";
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";
import {Card, Col, Icon, Row, Spin} from "antd";
import {OnlyAuth} from "../AuthContext";
import {Link} from "react-router-dom";
import {CoordinateWrapper} from "../common/CoordinateWrapper";
import StarMap from "../common/StarMap";
import {UploadedFilesList} from "./UploadedFilesList";

export class CzevStarDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: null,
            error: null
        }
    }

    async componentDidMount() {
        this.setState({...this.state, loading: true});
        try {
            const result = await axios.get(BASE_URL + "/czev/stars/" + this.props.match.params.id);
            this.setState({...this.state, data: result.data, loading: false});
        } catch (error) {
            if (error.response) {
                this.setState({...this.state, loading: false, data: null, error: error.response})
            }
        }
    }

    render() {
        const data = this.state.data;
        let body = (<span/>);
        if (data) {
            body = (<Row gutter={8}>
                <Col span={24} xxl={{span: 8}} md={{span: 12}}>
                    <h3>CzeV {data.czevId} {data.constellation.abbreviation}
                        <OnlyAuth>
                            <Link
                                to={`/czev/${data.czevId}/edit`}><Icon title="Edit" className="clickable-icon"
                                                                       type="edit"/>
                            </Link>
                        </OnlyAuth>
                    </h3>
                    <div>{data.crossIdentifications.join(" / ")}</div>
                    <div><b>Type: </b>{data.type}</div>
                    <div><b>J: </b>{data.jmagnitude}</div>
                    <div><b>V: </b>{data.vmagnitude}</div>
                    <div><b>K: </b>{data.kmagnitude}</div>
                    <div><b>Amplitude: </b>{data.amplitude}</div>
                    <div><b>Filter band: </b>{data.filterBand ? data.filterBand.name : ''}</div>
                    <div><b>Epoch: </b>{data.m0}</div>
                    <div><b>Period: </b>{data.period}</div>
                    <div><b>Year of discovery: </b>{data.year}</div>
                    <div><b>Discoverer: </b>{data.discoverers.map(d => `${d.firstName} ${d.lastName}`).join(", ")}</div>
                    <div><b>Note: </b>{data.publicNote}</div>
                    <div><b>Files: </b><UploadedFilesList files={data.files} disableActions/></div>
                </Col>
                <Col span={24} xxl={{span: 8}} md={{span: 12}}>
                    <div style={{textAlign: 'center'}}>
                        <span style={{display: "inline-block"}}><span>RA: </span><CoordinateWrapper size="large"
                                                                                                    value={data.coordinates.raString}/></span>&nbsp;
                        <span style={{display: "inline-block"}}><span>DEC: </span><CoordinateWrapper size="large"
                                                                                                     value={data.coordinates.decString}/></span>
                    </div>
                    <StarMap coordinates={data.coordinates}/>
                </Col>
            </Row>)
        } else if (this.state.error) {
            if (this.state.error.status === 404) {
                body = (<div>Not found</div>)
            } else {
                body = (<div>Error occurred</div>)
            }
        }
        return (
            <Card>
                <Spin spinning={this.state.loading}>
                    {body}
                </Spin>
            </Card>
        )
    }
}
