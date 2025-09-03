import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Header from './Header';
import Sidebar from './Sidebar';
import { getInterestRates, addInterestRate, updateInterestRate, deleteInterestRate } from '../services/api';

const InterestRate = () => {
  const [role, setRole] = useState('');
  const [interestRates, setInterestRates] = useState([]);
  const [formData, setFormData] = useState({ rate: '', effectiveDate: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchInterestRates = useCallback(async () => {
    try {
      const response = await getInterestRates();
      console.log('Fetched interest rates response:', response.data); // Debug
      setInterestRates(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (err) {
      console.error('Fetch Interest Rates Error:', err);
      setError('Failed to fetch interest rates');
      setInterestRates([]);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    try {
      const user = jwtDecode(token).user;
      console.log('Decoded user:', user); // Debug
      if (user.role !== 'admin') {
        console.log('Non-admin user, redirecting to dashboard');
        navigate('/dashboard');
        return;
      }
      setRole(user.role);
      fetchInterestRates();
    } catch (err) {
      console.error('Token Decode Error:', err);
      navigate('/login');
    }
  }, [navigate, fetchInterestRates]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.rate || !formData.effectiveDate) {
      setError('All fields are required');
      console.log('Form validation failed:', formData);
      return;
    }
    if (isNaN(formData.rate) || parseFloat(formData.rate) <= 0) {
      setError('Interest rate must be a positive number');
      console.log('Invalid rate:', formData.rate);
      return;
    }
    const payload = {
      rate: parseFloat(formData.rate),
      effectiveDate: formData.effectiveDate
    };
    console.log('Submitting payload:', payload); // Debug
    try {
      if (editId) {
        console.log('Updating interest rate with ID:', editId);
        await updateInterestRate(editId, payload);
      } else {
        console.log('Adding new interest rate');
        await addInterestRate(payload);
      }
      setFormData({ rate: '', effectiveDate: '' });
      setEditId(null);
      setError('');
      fetchInterestRates();
    } catch (err) {
      console.error('Submit Error:', err);
      setError(err.response?.data?.msg || 'Operation failed');
    }
  };

  const handleEdit = (interestRate) => {
    console.log('Editing interest rate:', interestRate); // Debug
    setEditId(interestRate._id);
    setFormData({ rate: interestRate.rate.toString(), effectiveDate: interestRate.effectiveDate.split('T')[0] });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this interest rate?')) {
      try {
        console.log('Deleting interest rate with ID:', id); // Debug
        await deleteInterestRate(id);
        fetchInterestRates();
      } catch (err) {
        console.error('Delete Error:', err);
        setError('Failed to delete interest rate');
      }
    }
  };

  const handleLogout = () => {
    console.log('Logging out');
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

          <div className="card mb-4 shadow">
            <div className="card-body">
              <h3 className="card-title">{editId ? 'Update Interest Rate' : 'Add New Interest Rate'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="rate" className="form-label">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="rate"
                    name="rate"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    placeholder="Enter interest rate"
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
                  {editId ? 'Update Interest Rate' : 'Add Interest Rate'}
                </button>
                {editId && (
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => {
                      setEditId(null);
                      setFormData({ rate: '', effectiveDate: '' });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>
          </div>

          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title">Interest Rates</h3>
              {interestRates.length === 0 ? (
                <p>No interest rates recorded</p>
              ) : (
                <ul className="list-group">
                  {interestRates.map((rate) => (
                    <li key={rate._id} className="list-group-item d-flex justify-content-between align-items-center">
                      {rate.rate}% (Effective: {new Date(rate.effectiveDate).toLocaleDateString()})
                      <div>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => handleEdit(rate)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(rate._id)}
                        >
                          Delete
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

export default InterestRate;