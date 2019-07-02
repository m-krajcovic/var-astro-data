import axios from "axios";

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;

}, (error) => {
    // Do something with request error
    return Promise.reject(error);
});
