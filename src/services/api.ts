import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8090/api/v1/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@Intellisys:user');
      localStorage.removeItem('@Intellisys:colaborador');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
