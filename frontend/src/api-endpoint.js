const apiBase = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8080/api';

export const BASE_URL = apiBase;
