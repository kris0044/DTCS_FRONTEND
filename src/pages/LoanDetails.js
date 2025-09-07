// components/LoanDetails.js
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getLoanDetails } from '../services/api';
import Header from './Header';
import Sidebar from './Sidebar';

const LoanDetails = () => {
  const { id } = useParams();
  const [role, setRole] = useState('');
  const [loan, setLoan] = useState(null);
  const [paidEMIs, setPaidEMIs] = useState(0);
  const [pendingEMIs, setPendingEMIs] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const user = jwtDecode(token).user;
      setRole(user.role);
      fetchLoanDetails();
    } catch (err) {
      console.error('Token Decode Error:', err.stack);
      setError('Invalid token, please log in again');
      navigate('/login');
    }
  }, [id, navigate]);

  const fetchLoanDetails = async () => {
    setLoading(true);
    try {
      const res = await getLoanDetails(id);
      setLoan(res.data.loan);
      setPaidEMIs(res.data.paidEMIs);
      setPendingEMIs(res.data.pendingEMIs);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch loan details');
    } finally {
      setLoading(false);
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
          <h2 className="mb-4">Loan Details</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {loading && <div className="alert alert-info">Loading...</div>}
          {loan && (
            <div className="card shadow">
              <div className="card-body">
                <h3 className="card-title">Loan ID: {loan._id}</h3>
                <p><strong>User:</strong> {role === 'admin' ? loan.user?.name || 'Unknown' : 'You'}</p>
                <p><strong>Amount:</strong> ₹{loan.amount}</p>
                <p><strong>Reason:</strong> {loan.reason}</p>
                <p><strong>Interest Rate:</strong> {loan.interestRate ? `${loan.interestRate}%` : 'N/A'}</p>
                <p><strong>Duration:</strong> {loan.duration ? `${loan.duration} months` : 'N/A'}</p>
                <p><strong>Total Payable:</strong> ₹{loan.totalAmountPayable ? loan.totalAmountPayable.toFixed(2) : 'N/A'}</p>
                <p><strong>Monthly EMI:</strong> ₹{loan.emiAmount ? loan.emiAmount.toFixed(2) : 'N/A'}</p>
                <p><strong>Amount Paid:</strong> ₹{paidEMIs.toFixed(2)}</p>
                <p><strong>Pending EMIs:</strong> {pendingEMIs}</p>
                <h4 className="mt-4">Payment Schedule</h4>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Payment #</th>
                      <th>Amount (₹)</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loan.payments.map((payment, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{payment.amount.toFixed(2)}</td>
                        <td>{new Date(payment.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge bg-${payment.status === 'paid' ? 'success' : 'warning'} text-white`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;