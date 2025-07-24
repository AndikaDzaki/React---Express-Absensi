import axios from "axios";

const API_URL = "http://localhost:8800/api";

export const login = (email: string, password: string) => axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });

export const logout = () => axios.post(`${API_URL}/logout`, null, { withCredentials: true });

export const getMeAdmin = () =>
  axios.get(`${API_URL}/admin/me`, { withCredentials: true });

export const getMeGuru = () =>
  axios.get(`${API_URL}/guru/me`, { withCredentials: true });



