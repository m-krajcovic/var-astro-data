import React, {Component} from "react";
import {Breadcrumb} from "antd";
import {Link, withRouter} from "react-router-dom";

class PathBreadCrumbsComponent extends Component {
    static defaultProps = {
        breadcrumbNameMap: {}
    };

    render() {
        const pathSnippets = this.props.location.pathname.split("/").filter(i => i);
        const breadcrumbs = [];
        pathSnippets.forEach((snippet, index) => {
            const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
            const name = this.props.breadcrumbNameMap.hasOwnProperty(url) ? this.props.breadcrumbNameMap[url] : snippet;
            if (name !== null) {
                breadcrumbs.push((
                    <Breadcrumb.Item key={url}>
                        <Link to={url}>
                            {name}
                        </Link>
                    </Breadcrumb.Item>
                ));
            }
        });
        return (
            <Breadcrumb style={{marginBottom: 12}}>
                {breadcrumbs}
            </Breadcrumb>
        )
    }
}

export const PathBreadCrumbs = withRouter(PathBreadCrumbsComponent);
