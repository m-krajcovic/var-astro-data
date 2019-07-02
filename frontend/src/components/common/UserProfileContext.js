import React from 'react';

const UserProfileContext = React.createContext();

class UserProfileProvider extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            config: {
                predictionPoints: 5,
                xAxisOptionKey: 'epoch'
            }
        };
        try {
            const config = localStorage.getItem('user_config');
            if (config != null) {
                this.state = {config: JSON.parse(config)};
            }
        } catch {
            // it's ok
        }
    }

    updateConfig = (newConfig) => {
        localStorage.setItem('user_config', JSON.stringify(newConfig));
        this.setState({config: newConfig});
    };

    render() {
        return (
            <UserProfileContext.Provider
                value={{
                    config: this.state.config,
                    updateConfig: this.updateConfig
                }}
            >
                {this.props.children}
            </UserProfileContext.Provider>
        )
    }
}

const UserProfileConsumer = UserProfileContext.Consumer;

export {UserProfileProvider, UserProfileConsumer};
