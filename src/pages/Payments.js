import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getPayments, makePayment, updatePayment, deletePayment } from '../services/api';
import Header from './Header';
import Sidebar from './Sidebar';

const Payments = () => {
  const [role, setRole] = useState('');
  const [payments, setPayments] = useState([]); // Ensure initial state is an array
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(10);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({ amount: 600, month: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPayments(currentPage, paymentsPerPage);
      // Ensure payments is an array
      const paymentsData = Array.isArray(res.data.payments) ? res.data.payments : [];
      setPayments(paymentsData);
      setTotal(res.data.total || 0);
      // Debugging: Log the response to check its structure
      console.log('API Response:', res.data);
    } catch (err) {
      console.error('Fetch Payments Error:', err);
      setError('Failed to fetch payments');
      setPayments([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  }, [currentPage, paymentsPerPage]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const user = jwtDecode(token).user;
    setRole(user.role);
    fetchPayments();
  }, [navigate, fetchPayments]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowCreate = () => {
    setFormData({ amount: 600, month: '' });
    setFormError('');
    setShowCreateModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.month.trim()) {
      setFormError('Month is required');
      return;
    }
    if (formData.amount !== 600) {
      setFormError('Amount must be 600');
      return;
    }
    setLoading(true);
    try {
      await makePayment(formData);
      setShowCreateModal(false);
      fetchPayments();
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const handleShowUpdate = (payment) => {
    setSelectedPayment(payment);
    setFormData({ amount: payment.amount, month: payment.month });
    setFormError('');
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.month.trim()) {
      setFormError('Month is required');
      return;
    }
    if (formData.amount !== 600) {
      setFormError('Amount must be 600');
      return;
    }
    setLoading(true);
    try {
      await updatePayment(selectedPayment._id, formData);
      setShowUpdateModal(false);
      fetchPayments();
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Failed to update payment');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDelete = (payment) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deletePayment(selectedPayment._id);
      setShowDeleteModal(false);
      fetchPayments();
    } catch (err) {
      setError('Failed to delete payment');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const totalPages = Math.ceil(total / paymentsPerPage);

  return (
    <div className="d-flex">
      <Sidebar role={role} />
      <div className="flex-grow-1">
        <Header role={role} onLogout={handleLogout} />
        <div className="container mt-4">
          <h2 className="mb-4">Payment Management</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="card shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="card-title">All Payments</h3>
                {role === 'staff' && (
                  <button className="btn btn-primary" onClick={handleShowCreate} disabled={loading}>
                    Make Payment
                  </button>
                )}
              </div>
              {loading && <div className="alert alert-info">Loading...</div>}
              {payments.length === 0 && !loading ? (
                <p>No payments found</p>
              ) : (
                <>
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Amount</th>
                        <th>Month</th>
                        <th>Date</th>
                        {role === 'admin' && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(payment => (
                        <tr key={payment._id}>
                          <td>{payment.user?.name || 'Unknown'}</td>
                          <td>{payment.amount}</td>
                          <td>{payment.month}</td>
                          <td>{new Date(payment.date).toLocaleDateString()}</td>
                          {role === 'admin' && (
                            <td>
                              <button
                                className="btn btn-sm btn-primary me-1"
                                onClick={() => handleShowUpdate(payment)}
                                disabled={loading}
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger me-1"
                                onClick={() => handleShowDelete(payment)}
                                disabled={loading}
                                title="Delete"
                              >
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <nav>
                    <ul className="pagination justify-content-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                            disabled={loading}
                          >
                            {page}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Make Payment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCreateModal(false)}
                    disabled={loading}
                  ></button>
                </div>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger">{formError}</div>}
                  <form onSubmit={handleCreate}>
                    <div className="mb-3">
                      <label htmlFor="amount" className="form-label">Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        id="amount"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                        required
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="month" className="form-label">Month (YYYY-MM)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="month"
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                        required
                        placeholder="YYYY-MM"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Payment'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Modal */}
        {showUpdateModal && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Payment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowUpdateModal(false)}
                    disabled={loading}
                  ></button>
                </div>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger">{formError}</div>}
                  <form onSubmit={handleUpdate}>
                    <div className="mb-3">
                      <label htmlFor="amount" className="form-label">Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        id="amount"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                        required
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="month" className="form-label">Month (YYYY-MM)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="month"
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                        required
                        placeholder="YYYY-MM"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={loading}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this payment for {selectedPayment.month}?</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;