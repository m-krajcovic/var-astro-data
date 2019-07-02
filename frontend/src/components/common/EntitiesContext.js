import React from 'react';
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";

const EntitiesContext = React.createContext();

class EntitiesProvider extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            types: [],
            constellations: [],
            filterBands: [],
            observers: [],
            loading: false,
        };
    }

    componentDidMount() {
        this.load()
    }

    load() {
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
    }

    render() {
        return (
            <EntitiesContext.Provider
                value={{...this.state}}
            >
                {this.props.children}
            </EntitiesContext.Provider>
        )
    }
}

const EntitiesConsumer = EntitiesContext.Consumer;

export {EntitiesProvider, EntitiesConsumer}
