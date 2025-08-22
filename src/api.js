import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
