import React, {Fragment} from 'react';
import axios from "axios";
import {BASE_URL} from "../api-endpoint";
import decode from 'jwt-decode';

const AuthContext = React.createContext();

class AuthProvider extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isAuth: false,
            isAdmin: false,
        };
        const token = localStorage.getItem('auth_token');
        if (token != null) {
            this.state = this.loadToken(token);
        }
    }

    loadToken = (token) => {
        const decoded = decode(token);
        if (Date.now() / 1000 > decoded.exp) {
            this.logout();
            return {isAuth: false, isAdmin: false};
        }
        return {
            isAuth: decoded.authorities.indexOf('ROLE_USER') !== -1,
            isAdmin: decoded.authorities.indexOf('ROLE_ADMIN') !== -1
        };
    };

    login = (username, password) => {
        return axios.post(BASE_URL + "/auth/signin", {
            username, password
        }).then(result => {
            if (result.data.token) {
                localStorage.setItem('auth_token', result.data.token);
                this.setState(this.loadToken(result.data.token));
            }
            return result;
        }).catch(e => {
            return e;
        });
    };

    logout = () => {
        localStorage.removeItem('auth_token');
        this.setState({isAuth: false, isAdmin: false})
    };

    render() {
        return (
            <AuthContext.Provider
                value={{
                    isAuth: this.state.isAuth,
                    isAdmin: this.state.isAdmin,
                    login: this.login,
                    logout: this.logout
                }}
            >
                {this.props.children}
            </AuthContext.Provider>
        )
    }
}

const AuthConsumer = AuthContext.Consumer;

export {AuthProvider, AuthConsumer}


export function OnlyAdmin(props) {
    let {children, ...acyclicalProps} = props;
    const childrenWithProps = children ? React.Children.map(children, child =>
        React.cloneElement(child, {
            ...acyclicalProps
        })
    ) : null;

    return (
        <AuthConsumer>
            {({isAdmin}) => isAdmin ? (<Fragment>{childrenWithProps}</Fragment>) : null}
        </AuthConsumer>
    )
}

export function OnlyAuth(props) {
    let {children, ...acyclicalProps} = props;
    const childrenWithProps = children ? React.Children.map(children, child =>
        React.cloneElement(child, {
            ...acyclicalProps
        })
    ) : null;

    return (
        <AuthConsumer>
            {({isAuth}) => isAuth ? (<Fragment>{childrenWithProps}</Fragment>) : props.default}
        </AuthConsumer>
    )
}
