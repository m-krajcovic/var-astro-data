import React from 'react';
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";

const MinimaPublicationsContext = React.createContext();

class MinimaPublicationsProvider extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            publications: [],
            loading: false,
            reload: this.load
        };
    }

    componentDidMount() {
        this.load()
    }

    load = () => {
        this.setState({...this.state, loading: true});
        axios.get(BASE_URL + "/ocgate/publications")
            .then(result => {
                this.setState({
                    ...this.state, publications: result.data, loading: false
                })
            })
            .catch(reason => {
                // :(
            });
    };

    render() {
        return (
            <MinimaPublicationsContext.Provider
                value={{...this.state}}
            >
                {this.props.children}
            </MinimaPublicationsContext.Provider>
        )
    }
}

const MinimaPublicationsConsumer = MinimaPublicationsContext.Consumer;

export {MinimaPublicationsProvider, MinimaPublicationsConsumer}
