import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers['x-auth-token'] = localStorage.getItem('token');
  }
  return req;
});

export const register = (data) => API.post('/api/auth/register', data);
export const login = (data) => API.post('/api/auth/login', data);
export const getPendingUsers = () => API.get('/api/auth/pending');
export const getAllUsers = (page, limit) => API.get(`/api/auth/all?page=${page}&limit=${limit}`);
export const approveUser = (id) => API.put(`/api/auth/approve/${id}`);
export const rejectUser = (id) => API.put(`/api/auth/reject/${id}`);
export const updateUser = (data, id = null) => {
  if (id) {
    return API.put(`/api/auth/update/${id}`, data); // For admin updates
  }
  return API.put('/api/auth/update', data); // For self-updates
};
export const deleteUser = (id) => API.delete(`/api/auth/${id}`);
export const getCurrentUser = () => API.get('/api/auth/me');

export const makePayment = (data) => API.post('/api/payments', data);
export const getPayments = () => API.get('/api/payments');
export const updatePayment = (id, data) => API.put(`/api/payments/${id}`, data);
export const deletePayment = (id) => API.delete(`/api/payments/${id}`);


export const getLoans = (page, limit) => API.get(`/api/loans?page=${page}&limit=${limit}`);
export const requestLoan = (data) => API.post('/api/loans', data);
export const updateLoan = (id, status) => API.put(`/api/loans/${id}`, { status });
export const deleteLoan = (id) => API.delete(`/api/loans/${id}`);
export const getLoanDetails = (id) => API.get(`/api/loans/${id}`);

// In ../services/api.js
export const getCurrentAmount = () => API.get('/api/amounts/current');
export const getAmounts = () => API.get('/api/amounts');
export const addAmount = (data) => API.post('/api/amounts', data);
export const updateAmount = (id, data) => API.put(`/api/amounts/${id}`, data);
export const deleteAmount = (id) => API.delete(`/api/amounts/${id}`);
export const updatePaymentStatus = (loanId, paymentIndex, newStatus) => {
  return API.put(`/api/loans/${loanId}/payments/${paymentIndex}`, { status: newStatus });
}

export const addInterestRate = (data) => API.post(`/api/interest-rates`);
export const getInterestRates = () => API.get(`/api/interest-rates`);
export const updateInterestRate = (id, data) => API.put(`/api/interest-rates/${id}`);
export const deleteInterestRate = (id) => API.delete(`/api/interest-rates/${id}`);


export const getNotices = () => API.get('/api/notices');
export const addNotice = (data) => API.post('/api/notices', data);
export const updateNotice = (id, data) => API.put(`/api/notices/${id}`, data);
export const deleteNotice = (id) => API.delete(`/api/notices/${id}`);

export const getMeetings = () => API.get('/api/meetings');
export const addMeeting = (data) => API.post('/api/meetings', data);  
export const updateMeeting = (id, data) => API.put(`/api/meetings/${id}`, data);
export const deleteMeeting = (id) => API.delete(`/api/meetings/${id}`);

export const getBalanceEntries = () => API.get('/api/balances');
export const createBalanceEntry = (data) => API.post('/api/balances', data);
export const updateBalanceEntry = (id, data) => API.put(`/api/balances/${id}`, data);
export const deleteBalanceEntry = (id) => API.delete(`/api/balances/${id}`);


export const requestResignation = (data) => API.post('/api/resignations', data);
export const updateResignation = (id, data) => API.put(`/api/resignations/${id}`, data);
export const deleteResignation = (id) => API.delete(`/api/resignations/${id}`);
export const getResignations = (page, limit) => API.get(`/api/resignations?page=${page}&limit=${limit}`);
export const getResignationDetails = (id) => API.get(`/api/resignations/${id}`);

export const getDashboardData = () => API.get('/api/dashboard');
export default API;