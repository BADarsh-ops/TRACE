import axios from 'axios';
const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:4000/api'});
api.interceptors.request.use(config=>{const token=localStorage.getItem('trace_token');if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
api.interceptors.response.use(r=>r,e=>{const message=e.response?.data?.error||e.message||'Request failed';return Promise.reject(new Error(message));});
export default api;
