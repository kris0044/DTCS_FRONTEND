import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Header from './Header';
import Sidebar from './Sidebar';
import { getAmounts, updateAmount } from '../services/api';

const Amount = () => {
  const [role, setRole] = useState('');
  const [amounts, setAmounts] = useState([]);
  const [formData, setFormData] = useState({ amount: '', effectiveDate: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAmounts = useCallback(async () => {
    try {
      const response = await getAmounts();
      setAmounts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Fetch Amounts Error:', err);
      setError('Failed to fetch amounts');
      setAmounts([]);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const user = jwtDecode(token).user;
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    setRole(user.role);
    fetchAmounts();
  }, [navigate, fetchAmounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.effectiveDate) {
      setError('All fields are required');
      return;
    }
    if (formData.amount <= 0) {
      setError('Amount must be positive');
      return;
    }
    try {
      await updateAmount(editId, { amount: formData.amount, effectiveDate: formData.effectiveDate });
      setFormData({ amount: '', effectiveDate: '' });
      setEditId(null);
      setError('');
      fetchAmounts();
    } catch (err) {
      setError(err.response?.data?.msg || 'Update failed');
    }
  };

  const handleEdit = (amount) => {
    setEditId(amount._id);
    setFormData({ amount: amount.amount, effectiveDate: amount.effectiveDate.split('T')[0] });
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

          {editId && (
            <div className="card mb-4 shadow">
              <div className="card-body">
                <h3 className="card-title">Update Amount</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="amount" className="form-label">Monthly Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="effectiveDate" className="form-label">Effective Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="effectiveDate"
                      name="effectiveDate"
                      value={formData.effectiveDate}
                      onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Update Amount
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => {
                      setEditId(null);
                      setFormData({ amount: '', effectiveDate: '' });
                    }}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title">Monthly Amounts</h3>
              {amounts.length === 0 ? (
                <p>No amounts recorded</p>
              ) : (
                <ul className="list-group">
                  {amounts.map((amt) => (
                    <li key={amt._id} className="list-group-item d-flex justify-content-between align-items-center">
                      ₹{amt.amount}
                      <div>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEdit(amt)}
                        >
                          Edit
                        </button>
                      </div>
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

export default Amount;