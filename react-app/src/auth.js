const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

export const user = {
    token: null,
    id: -1,
    username: "",
    roles: []
};

const loadToUser = (token) => {
    const payload = parseJwt(token);
    user.token = token;
    user.id = payload.sub;
    user.username = payload.username;
    user.roles = payload.roles;
};

export const isCzevAdmin = () => {
    return user.roles.indexOf("ROLE_ADMIN") !== -1;
};

export const isLoggedIn = () => {
    return user.token !== null
};

export function login(username, password) {

}
