import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers['x-auth-token'] = localStorage.getItem('token');
  }
  return req;
});

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getPendingUsers = () => API.get('/auth/pending');
export const getAllUsers = (page, limit) => API.get(`/auth/all?page=${page}&limit=${limit}`);
export const approveUser = (id) => API.put(`/auth/approve/${id}`);
export const rejectUser = (id) => API.put(`/auth/reject/${id}`);
export const updateUser = (id, data) => API.put(`/auth/update/${id}`, data);
export const deleteUser = (id) => API.delete(`/auth/${id}`);
export const makePayment = (data) => API.post('/payments', data);
export const getPayments = () => API.get('/payments');
export const requestLoan = (data) => API.post('/loans', data);
export const updateLoan = (id, status) => API.put(`/loans/${id}`, { status });
export const getLoans = () => API.get('/loans');