import { useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getPendingUsers, approveUser, getPayments, makePayment, getLoans, requestLoan, updateLoan, getCurrentAmount } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Dashboard = () => {
  const [role, setRole] = useState('');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [currentAmount, setCurrentAmount] = useState(null);
  const [formData, setFormData] = useState({ loanAmount: '', loanReason: '', paymentMonth: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      if (role === 'admin') {
        const usersRes = await getPendingUsers();
        setPendingUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      }
      const paymentsRes = await getPayments();
      const paymentsData = Array.isArray(paymentsRes.data.payments) ? paymentsRes.data.payments : [];
      setPayments(paymentsData);
      const loansRes = await getLoans();
      setLoans(Array.isArray(loansRes.data) ? loansRes.data : []);
      // Fetch current amount for staff or admin
      const amountRes = await getCurrentAmount();
      console.log('Current Amount API Response:', amountRes.data);
      setCurrentAmount(amountRes.data.amount || 600);
      console.log('Current Amount:', amountRes.data.amount || 600);
      console.log('Payments API Response:', paymentsRes.data);
    } catch (err) {
      console.error('Fetch Data Error:', err.response || err);
      const errorMsg = err.response?.data?.error || err.response?.data?.msg || 'Failed to fetch data';
      setError(errorMsg);
      setPayments([]);
      setLoans([]);
      setCurrentAmount(600);
      if (role === 'admin') setPendingUsers([]);
    }
  }, [role]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const user = jwtDecode(token).user;
      setRole(user.role);
      fetchData();
    } catch (err) {
      console.error('Token Decode Error:', err.stack);
      setError('Invalid token, please log in again');
      navigate('/login');
    }
  }, [navigate, fetchData]);

  const handleApproveUser = async (id) => {
    try {
      await approveUser(id);
      fetchData();
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
    if (!currentAmount) {
      setError('Payment amount not available');
      return;
    }
    try {
      await makePayment({ amount: currentAmount, month: formData.paymentMonth });
      setFormData({ ...formData, paymentMonth: '' });
      fetchData();
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
      fetchData();
    } catch (err) {
      setError(err.response?.data?.msg || 'Loan request failed');
    }
  };

  const handleUpdateLoan = async (id, status) => {
    try {
      await updateLoan(id, status);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.msg || 'Loan update failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="d-flex">
      <Sidebar role={role} />
      <div className="flex-grow-1">
        <Header role={role} onLogout={handleLogout} />
        <div className="container mt-4">
          {error && <div className="alert alert-danger">{error}</div>}

          {role === 'staff' && (
            <>
              <div className="card mb-4 shadow">
                <div className="card-body">
                  <h3 className="card-title">Make Monthly Payment</h3>
                  <form onSubmit={handleMakePayment}>
                    <div className="mb-3">
                      <label htmlFor="paymentMonth" className="form-label">Month (e.g., 2025-08)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="paymentMonth"
                        name="paymentMonth"
                        value={formData.paymentMonth}
                        onChange={(e) => setFormData({ ...formData, paymentMonth: e.target.value })}
                        placeholder="Enter month"
                      />
                    </div>
                    <button type="submit" className="btn btn-success" disabled={currentAmount === null}>
                      Pay ₹{currentAmount !== null ? currentAmount : 'Loading...'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="card mb-4 shadow">
                <div className="card-body">
                  <h3 className="card-title">Request Loan</h3>
                  <form onSubmit={handleRequestLoan}>
                    <div className="mb-3">
                      <label htmlFor="loanAmount" className="form-label">Amount (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="loanAmount"
                        name="loanAmount"
                        value={formData.loanAmount}
                        onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="loanReason" className="form-label">Reason</label>
                      <input
                        type="text"
                        className="form-control"
                        id="loanReason"
                        name="loanReason"
                        value={formData.loanReason}
                        onChange={(e) => setFormData({ ...formData, loanReason: e.target.value })}
                        placeholder="Enter reason"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">Request Loan</button>
                  </form>
                </div>
              </div>
            </>
          )}

          {role === 'admin' && (
            <>
              <div className="card mb-4 shadow">
                <div className="card-body">
                  <h3 className="card-title">Pending User Approvals</h3>
                  {pendingUsers.length === 0 ? (
                    <p>No pending approvals</p>
                  ) : (
                    <ul className="list-group">
                      {pendingUsers.map(user => (
                        <li key={user._id} className="list-group-item d-flex justify-content-between align-items-center">
                          {user.name} ({user.email})
                          <button className="btn btn-sm btn-success" onClick={() => handleApproveUser(user._id)}>Approve</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="card mb-4 shadow">
                <div className="card-body">
                  <h3 className="card-title">Loan Requests</h3>
                  {loans.filter(l => l.status === 'pending').length === 0 ? (
                    <p>No pending loans</p>
                  ) : (
                    <ul className="list-group">
                      {loans.filter(l => l.status === 'pending').map(loan => (
                        <li key={loan._id} className="list-group-item d-flex justify-content-between align-items-center">
                          {loan.user.name}: ₹{loan.amount} - {loan.reason}
                          <div>
                            <button className="btn btn-sm btn-success me-2" onClick={() => handleUpdateLoan(loan._id, 'approved')}>
                              Approve
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleUpdateLoan(loan._id, 'rejected')}>
                              Reject
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="card mb-4 shadow">
            <div className="card-body">
              <h3 className="card-title">Payment History</h3>
              {payments.length === 0 ? (
                <p>No payments recorded</p>
              ) : (
                <ul className="list-group">
                  {payments.map(p => (
                    <li key={p._id} className="list-group-item">
                      ₹{p.amount} for {p.month} on {new Date(p.date).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title">Loan History</h3>
              {loans.length === 0 ? (
                <p>No loans recorded</p>
              ) : (
                <ul className="list-group">
                  {loans.map(l => (
                    <li key={l._id} className="list-group-item">
                      ₹{l.amount} - {l.reason} ({l.status}) on {new Date(l.date).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;