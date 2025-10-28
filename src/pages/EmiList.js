import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getLoans, getAllUsers } from '../services/api';
import Header from './Header';
import Sidebar from './Sidebar';

const EmiList = () => {
  const [role, setRole] = useState('');
  const [loans, setLoans] = useState([]);
  const [emis, setEmis] = useState([]);
  const [filteredEmis, setFilteredEmis] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedLoan, setSelectedLoan] = useState('');
  const [availableLoans, setAvailableLoans] = useState([]);
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
      fetchLoans();
      if (user.role === 'admin') {
        fetchUsers();
      }
    } catch (err) {
      console.error('Token Decode Error:', err.stack);
      setError('Invalid token, please log in again');
      navigate('/login');
    }
  }, [navigate]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await getLoans(1, 1000); // Fetch up to 1000 loans to get all
      setLoans(res.data.loans);
      const flattened = flattenEmis(res.data.loans);
      setEmis(flattened);
      setFilteredEmis(flattened);
      setAvailableLoans(res.data.loans);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch loans');
      console.error('Fetch loans error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers(1, 1000); // Fetch up to 1000 users
      setUsers(res.data.users);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch users');
      console.error('Fetch users error:', err.response?.data);
    }
  };

  const flattenEmis = (loans) => {
    return loans.flatMap((loan) =>
      loan.payments.map((payment, index) => ({
        loanId: loan._id,
        loanReason: loan.reason,
        userId: loan.user._id,
        userName: loan.user.name || 'Unknown',
        paymentIndex: index + 1,
        amount: Number(payment.amount).toFixed(2),
        date: new Date(payment.date).toLocaleDateString(),
        status: payment.status,
      }))
    );
  };

  useEffect(() => {
    let filtered = emis;
    if (role === 'admin' && selectedUser) {
      filtered = filtered.filter((emi) => emi.userId === selectedUser);
    }
    if (selectedLoan) {
      filtered = filtered.filter((emi) => emi.loanId === selectedLoan);
    }
    setFilteredEmis(filtered);

    // Update available loans based on selected user
    let availLoans = loans;
    if (role === 'admin' && selectedUser) {
      availLoans = loans.filter((loan) => loan.user._id === selectedUser);
    }
    setAvailableLoans(availLoans);
    if (selectedLoan && !availLoans.some((loan) => loan._id === selectedLoan)) {
      setSelectedLoan('');
    }
  }, [selectedUser, selectedLoan, role, emis, loans]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  // Calculate summary statistics
  const totalEmis = filteredEmis.length;
  const paidEmis = filteredEmis.filter((emi) => emi.status === 'paid').length;
  const pendingEmis = filteredEmis.filter((emi) => emi.status === 'pending').length;
  const totalAmountToPay = filteredEmis.reduce((sum, emi) => sum + parseFloat(emi.amount), 0).toFixed(2);
  const totalAmountPaid = filteredEmis
    .filter((emi) => emi.status === 'paid')
    .reduce((sum, emi) => sum + parseFloat(emi.amount), 0)
    .toFixed(2);

  return (
    <div className="min-vh-100 d-flex" style={{ backgroundColor: '#ffffff' }}>
      <Sidebar role={role} />
      <div className="flex-grow-1">
        <Header role={role} onLogout={handleLogout} />
        <div className="container mt-4 p-4">
          <h2 className="mb-4" style={{ color: '#333333' }}>EMI List</h2>
          {error && (
            <div
              className="alert text-center"
              style={{ border: '2px solid #dc3545', backgroundColor: '#ffffff', color: '#dc3545' }}
            >
              {error}
            </div>
          )}
          {loading && (
            <div className="alert alert-info" style={{ backgroundColor: '#e9ecef', color: '#333333' }}>
              Loading...
            </div>
          )}
          <div className="mb-4">
            {role === 'admin' && (
              <select
                className="form-select me-2 d-inline-block"
                style={{ width: 'auto' }}
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            )}
            <select
              className="form-select d-inline-block"
              style={{ width: 'auto' }}
              value={selectedLoan}
              onChange={(e) => setSelectedLoan(e.target.value)}
            >
              <option value="">All Loans</option>
              {availableLoans.map((loan) => (
                <option key={loan._id} value={loan._id}>
                  {loan.reason} 
                </option>
              ))}
            </select>
          </div>
          <div className="card shadow-lg" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
            <div className="card-body">
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th style={{ color: '#333333' }}>Loan Reason</th>
                    <th style={{ color: '#333333' }}>User Name</th>
                    <th style={{ color: '#333333' }}>Payment #</th>
                    <th style={{ color: '#333333' }}>Amount (₹)</th>
                    <th style={{ color: '#333333' }}>Due Date</th>
                    <th style={{ color: '#333333' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmis.map((emi, idx) => (
                    <tr key={idx}>
                      <td style={{ color: '#333333' }}>{emi.loanReason}</td>
                      <td style={{ color: '#333333' }}>{emi.userName}</td>
                      <td style={{ color: '#333333' }}>{emi.paymentIndex}</td>
                      <td style={{ color: '#333333' }}>{emi.amount}</td>
                      <td style={{ color: '#333333' }}>{emi.date}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(emi.status)} text-white`}>
                          {emi.status.charAt(0).toUpperCase() + emi.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3" style={{ color: '#333333' }}>
                <strong>Total EMIs:</strong> {totalEmis} | 
                <strong> Paid EMIs:</strong> {paidEmis} | 
                <strong> Pending EMIs:</strong> {pendingEmis} | 
                <strong> Total Amount to Pay:</strong> ₹{totalAmountToPay} | 
                <strong> Total Amount Paid:</strong> ₹{totalAmountPaid}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmiList;