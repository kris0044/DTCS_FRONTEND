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
export const updatePayment = (id, data) => API.put(`/payments/${id}`, data);
export const deletePayment = (id) => API.delete(`/payments/${id}`);


export const getLoans = (page, limit) => API.get(`/loans?page=${page}&limit=${limit}`);
export const requestLoan = (data) => API.post('/loans', data);
export const updateLoan = (id, status) => API.put(`/loans/${id}`, { status });
export const deleteLoan = (id) => API.delete(`/loans/${id}`);

// In ../services/api.js
export const getCurrentAmount = () => API.get('/amounts/current');
export const getAmounts = () => API.get('/amounts');
export const addAmount = (data) => API.post('/amounts', data);
export const updateAmount = (id, data) => API.put(`/amounts/${id}`, data);
export const deleteAmount = (id) => API.delete(`/amounts/${id}`);

export const addInterestRate = (data) => API.post(`/interest-rates`);
export const getInterestRates = () => API.get(`/interest-rates`);
export const updateInterestRate = (id, data) => API.put(`/interest-rates/${id}`);
export const deleteInterestRate = (id) => API.delete(`/interest-rates/${id}`);