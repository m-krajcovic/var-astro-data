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
            loaded: false
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
                    loaded: true,
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
                    isAuth: this.state.isAuth,
                    isAdmin: this.state.isAdmin,
                    login: this.login,
                    logout: this.logout
                }}
            >
                {this.props.children}
            </ObservationsContext.Provider>
        )
    }
}

const ObservationsConsumer = ObservationsContext.Consumer;

export {ObservationsProvider, ObservationsConsumer}
