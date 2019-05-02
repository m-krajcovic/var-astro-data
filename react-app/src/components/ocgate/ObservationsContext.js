import React from 'react';
import axios from "axios";
import {BASE_URL} from "../../api-endpoint";

const ObservationsContext = React.createContext();

class ObservationsProvider extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            filters: [],
            methods: [],
            kinds: [],
            loading: true
        };
    }

    componentDidMount() {
        this.load()
    }

    load() {
        const filtersPromise = axios.get(BASE_URL + "/ocgate/observations/filters");
        const methodsPromise = axios.get(BASE_URL + "/ocgate/observations/methods");
        const kindsPromise = axios.get(BASE_URL + "/ocgate/observations/kinds");
        Promise.all([filtersPromise, methodsPromise, kindsPromise])
            .then(result => {
                this.setState({
                    loading: false,
                    filters: result[0].data,
                    methods: result[1].data,
                    kinds: result[2].data
                });
            })
            .catch(reason => {
                // :(
            });
    }

    render() {
        return (
            <ObservationsContext.Provider
                value={{
                    filters: this.state.filters,
                    methods: this.state.methods,
                    kinds: this.state.kinds,
                    loading: this.state.loading
                }}
            >
                {this.props.children}
            </ObservationsContext.Provider>
        )
    }
}

const ObservationsConsumer = ObservationsContext.Consumer;

export {ObservationsProvider, ObservationsConsumer}
