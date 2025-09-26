import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getDashboardData, approveUser, makePayment, requestLoan, updateLoan } from '../services/api';

const useDashboard = () => {
  const [role, setRole] = useState('');
  const [dashboardData, setDashboardData] = useState({
    currentAmount: null,
    notices: [],
    meetings: [],
    paymentSummary: [],
    loanSummary: [],
    pendingUsers: [],
    userPayments: [],
    userLoans: [],
    counts: {
      completedLoans: 0,
      pendingLoans: 0,
      ongoingLoans: 0,
      rejectedLoans: 0,
      totalUsers: 0,
      totalMeetings: 0,
      totalNotices: 0,
      totalBalance: 0,
      totalResignations: 0,
      totalPayments: 0,
    },
  });
  const [formData, setFormData] = useState({ loanAmount: '', loanReason: '', paymentMonth: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await getDashboardData();
      setDashboardData({
        currentAmount: res.data.currentAmount || null,
        notices: Array.isArray(res.data.notices) ? res.data.notices : [],
        meetings: Array.isArray(res.data.meetings) ? res.data.meetings : [],
        paymentSummary: Array.isArray(res.data.paymentSummary) ? res.data.paymentSummary : [],
        loanSummary: Array.isArray(res.data.loanSummary) ? res.data.loanSummary : [],
        pendingUsers: Array.isArray(res.data.pendingUsers) ? res.data.pendingUsers : [],
        userPayments: Array.isArray(res.data.userPayments) ? res.data.userPayments : [],
        userLoans: Array.isArray(res.data.userLoans) ? res.data.userLoans : [],
        counts: res.data.counts || {
          completedLoans: 0,
          pendingLoans: 0,
          ongoingLoans: 0,
          rejectedLoans: 0,
          totalUsers: 0,
          totalMeetings: 0,
          totalNotices: 0,
          totalBalance: 0,
          totalResignations: 0,
          totalPayments: 0,
        },
      });
    } catch (err) {
      console.error('Fetch Dashboard Data Error:', err.response || err);
      const errorMsg = err.response?.data?.msg || 'Failed to fetch dashboard data';
      setError(errorMsg);
      setDashboardData({
        currentAmount: null,
        notices: [],
        meetings: [],
        paymentSummary: [],
        loanSummary: [],
        pendingUsers: [],
        userPayments: [],
        userLoans: [],
        counts: {
          completedLoans: 0,
          pendingLoans: 0,
          ongoingLoans: 0,
          rejectedLoans: 0,
          totalUsers: 0,
          totalMeetings: 0,
          totalNotices: 0,
          totalBalance: 0,
          totalResignations: 0,
          totalPayments: 0,
        },
      });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const user = jwtDecode(token).user;
      setRole(user.role);
      fetchDashboardData();
    } catch (err) {
      console.error('Token Decode Error:', err.stack);
      setError('Invalid token, please log in again');
      navigate('/login');
    }
  }, [navigate, fetchDashboardData]);

  const handleApproveUser = async (id) => {
    try {
      await approveUser(id);
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to approve user');
    }
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
    if (!formData.paymentMonth) {
      setError('Month is required');
      return;
    }
    if (!dashboardData.currentAmount) {
      setError('Payment amount not available');
      return;
    }
    try {
      await makePayment({ amount: dashboardData.currentAmount.amount, month: formData.paymentMonth });
      setFormData({ ...formData, paymentMonth: '' });
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.msg || 'Payment failed');
    }
  };

  const handleRequestLoan = async (e) => {
    e.preventDefault();
    if (!formData.loanAmount || !formData.loanReason) {
      setError('All loan fields are required');
      return;
    }
    if (formData.loanAmount <= 0) {
      setError('Loan amount must be positive');
      return;
    }
    try {
      await requestLoan({ amount: formData.loanAmount, reason: formData.loanReason });
      setFormData({ ...formData, loanAmount: '', loanReason: '' });
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.msg || 'Loan request failed');
    }
  };

  const handleUpdateLoan = async (id, status) => {
    try {
      await updateLoan(id, { status });
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.msg || 'Loan update failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return {
    role,
    dashboardData,
    formData,
    error,
    setFormData,
    handleApproveUser,
    handleMakePayment,
    handleRequestLoan,
    handleUpdateLoan,
    handleLogout,
    setError,
  };
};

export default useDashboard;