import React, {Component} from "react";
import {Card, Spin, Layout} from "antd";

export class OcGateAdminNewStarPage extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <Layout.Content style={{margin: "24px 24px 0"}}>
                <Card>
                    <Spin>
                    </Spin>
                </Card>
            </Layout.Content>
        );
    }
}
