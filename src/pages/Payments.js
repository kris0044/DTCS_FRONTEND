import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getPayments, makePayment, updatePayment, deletePayment, getCurrentAmount } from '../services/api';
import Header from './Header';
import Sidebar from './Sidebar';
import swal from 'sweetalert';

const Payments = () => {
  const [role, setRole] = useState('');
  const [allPayments, setAllPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(10);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [formData, setFormData] = useState({ amount: '', month: '' });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ month: '', year: '', user: '' });
  const navigate = useNavigate();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all payments by requesting a large page size
      const res = await getPayments(1, 10000);
      const paymentsData = Array.isArray(res.data.payments) ? res.data.payments : [];
      setAllPayments(paymentsData);
      setTotal(res.data.total || 0);

      const amountRes = await getCurrentAmount();
      console.log('Current Amount API Response:', amountRes.data);
      setCurrentAmount(amountRes.data.amount);
      setFormData(prev => ({ ...prev, amount: amountRes.data.amount }));
      console.log('Current Amount:', amountRes.data.amount);
    } catch (err) {
      console.error('Fetch Data Error:', err);
      setError(err.response?.data?.msg || 'Failed to fetch data');
      setAllPayments([]);
      setCurrentAmount(null);
      setFormData({ amount: '', month: '' });
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredPayments = useMemo(() => {
    let filtered = allPayments;
    if (filters.month) {
      filtered = filtered.filter(payment =>
        payment.month.toLowerCase().includes(filters.month.toLowerCase())
      );
    }
    if (filters.year) {
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate.getFullYear().toString() === filters.year;
      });
    }
    if (filters.user) {
      filtered = filtered.filter(payment =>
        payment.user?.name?.toLowerCase().includes(filters.user.toLowerCase())
      );
    }
    return filtered;
  }, [allPayments, filters.month, filters.year, filters.user]);

  const currentPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * paymentsPerPage;
    return filteredPayments.slice(startIndex, startIndex + paymentsPerPage);
  }, [filteredPayments, currentPage, paymentsPerPage]);

  const filteredTotal = filteredPayments.length;
  const totalPages = Math.ceil(filteredTotal / paymentsPerPage);

  const totalAmount = useMemo(() => {
    return filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  }, [filteredPayments]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const user = jwtDecode(token).user;
      setRole(user.role);
      fetchPayments();
    } catch (err) {
      console.error('Token Decode Error:', err.stack);
      setError('Invalid token, please log in again');
      navigate('/login');
    }
  }, [navigate, fetchPayments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.month, filters.year, filters.user]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ month: '', year: '', user: '' });
  };

  const handleShowCreate = () => {
    setFormData({ amount: currentAmount || '', month: '' });
    setFormError('');
    setShowCreateModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.month.trim()) {
      setFormError('Month is required');
      return;
    }
    if (currentAmount === null) {
      setFormError('Payment amount not available');
      return;
    }
    if (parseInt(formData.amount) !== currentAmount) {
      setFormError(`Amount must be ₹${currentAmount}`);
      return;
    }

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        setFormError('Razorpay script failed to load');
        return;
      }

      swal({
        title: 'Confirm Payment',
        text: `Are you sure you want to make a payment of ₹${currentAmount} for ${formData.month}? This is not refundable.`,
        icon: 'warning',
        buttons: true,
        dangerMode: true,
      }).then(async (willPay) => {
        if (willPay) {
          const options = {
            key: 'rzp_test_zt5DDs1PmkkyDy', // Replace with your Razorpay key
            amount: currentAmount * 100, // Convert to smallest currency unit (paise)
            currency: 'INR',
            name: 'Society Management System',
            handler: async (response) => {
              console.log('Razorpay Response:', response);
              setLoading(true);
              try {
                await makePayment(formData);
                setShowCreateModal(false);
                fetchPayments();
                swal('Payment successful!', 'Your payment has been processed successfully.', 'success');
              } catch (err) {
                setFormError(err.response?.data?.msg || 'Failed to record payment');
                swal('Payment failed!', 'There was an error processing your payment.', 'error');
              } finally {
                setLoading(false);
              }
            },
            prefill: {
              name: jwtDecode(localStorage.getItem('token')).user.name,
              email: jwtDecode(localStorage.getItem('token')).user.email,
              contact: '',
            },
            theme: {
              color: '#007bff', // Match Bootstrap primary color
            },
          };

          const paymentObject = new window.Razorpay(options);
          paymentObject.open();
        }
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      setFormError('Failed to initiate payment');
      swal('Payment failed!', 'There was an error initiating your payment.', 'error');
    }
  };

  const handleShowUpdate = (payment) => {
    setSelectedPayment(payment);
    setFormData({ amount: currentAmount || payment.amount, month: payment.month });
    setFormError('');
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.month.trim()) {
      setFormError('Month is required');
      return;
    }
    if (currentAmount === null) {
      setFormError('Payment amount not available');
      return;
    }
    if (parseInt(formData.amount) !== currentAmount) {
      setFormError(`Amount must be ₹${currentAmount}`);
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

  return (
    <div className="min-vh-100 d-flex" style={{ backgroundColor: '#ffffff' }}>
      <Sidebar role={role} />
      <div className="flex-grow-1">
        <Header role={role} onLogout={handleLogout} />
        <div className="container mt-4 p-4">
          <h2 className="mb-4" style={{ color: '#333333' }}>Contribution Management</h2>
          {error && (
            <div
              className="alert text-center"
              style={{ border: '2px solid #dc3545', backgroundColor: '#ffffff', color: '#dc3545' }}
            >
              {error}
            </div>
          )}
          <div className="card shadow-lg" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="card-title" style={{ color: '#333333' }}>All Contribution</h3>
                {role === 'staff' && (
                  <button
                    className="btn btn-primary"
                    onClick={handleShowCreate}
                    disabled={loading || currentAmount === null}
                    style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
                  >
                    Make Payment {currentAmount !== null ? `₹${currentAmount.toFixed(2)}` : 'Loading...'}
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Month (e.g., January)"
                    value={filters.month}
                    onChange={(e) => handleFilterChange('month', e.target.value)}
                    style={{ color: '#333333' }}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Year (e.g., 2025)"
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    style={{ color: '#333333' }}
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="User Name"
                    value={filters.user}
                    onChange={(e) => handleFilterChange('user', e.target.value)}
                    style={{ color: '#333333' }}
                  />
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-secondary me-2"
                    onClick={handleClearFilters}
                    disabled={loading}
                    style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {loading && (
                <div className="alert alert-info" style={{ backgroundColor: '#e9ecef', color: '#333333' }}>
                  Loading...
                </div>
              )}
              {currentPayments.length === 0 && !loading ? (
                <p style={{ color: '#333333' }}>
                  No payments found {Object.values(filters).some(v => v) ? 'matching the filters' : ''}
                </p>
              ) : (
                <>
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th style={{ color: '#333333' }}>User</th>
                        <th style={{ color: '#333333' }}>Amount</th>
                        <th style={{ color: '#333333' }}>Month</th>
                        <th style={{ color: '#333333' }}>Date</th>
                        {role === 'admin' && <th style={{ color: '#333333' }}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentPayments.map(payment => (
                        <tr key={payment._id}>
                          <td style={{ color: '#333333' }}>{payment.user?.name || 'Unknown'}</td>
                          <td style={{ color: '#333333' }}>₹{payment.amount.toFixed(2)}</td>
                          <td style={{ color: '#333333' }}>{payment.month}</td>
                          <td style={{ color: '#333333' }}>{new Date(payment.date).toLocaleDateString()}</td>
                          {role === 'admin' && (
                            <td>
                              <button
                                className="btn btn-sm btn-primary me-1"
                                onClick={() => handleShowUpdate(payment)}
                                disabled={loading}
                                title="Edit"
                                style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger me-1"
                                onClick={() => handleShowDelete(payment)}
                                disabled={loading}
                                title="Delete"
                                style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                              >
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals Display */}
                  {filteredPayments.length > 0 && (
                    <div className="mb-3" style={{ color: '#333333' }}>
                      <strong>Total Contribution (filtered): {filteredTotal}</strong> | 
                      <strong> Total Amount (filtered): ₹{totalAmount.toFixed(2)}</strong>
                    </div>
                  )}

                  <nav>
                    <ul className="pagination justify-content-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                            disabled={loading}
                            style={{ color: currentPage === page ? '#ffffff' : '#007bff', backgroundColor: currentPage === page ? '#007bff' : '#ffffff' }}
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
              <div className="modal-content" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6' }}>
                  <h5 className="modal-title" style={{ color: '#333333' }}>Make Payment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowCreateModal(false)}
                    disabled={loading}
                  ></button>
                </div>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger" style={{ backgroundColor: '#ffffff', border: '2px solid #dc3545', color: '#dc3545' }}>
                      {formError}
                    </div>
                  )}
                  <form onSubmit={handleCreate}>
                    <div className="mb-3">
                      <label htmlFor="amount" className="form-label" style={{ color: '#333333' }}>
                        Amount
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="amount"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                        required
                        disabled
                        style={{ backgroundColor: '#e9ecef', color: '#333333' }}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="month" className="form-label" style={{ color: '#333333' }}>
                        Month
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="month"
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                        required
                        placeholder="january, february, march...etc."
                        style={{ color: '#333333' }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || currentAmount === null}
                      style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
                    >
                      {loading ? 'Submitting...' : `Submit Payment ₹${currentAmount?.toFixed(2) || 'Loading...'}`}
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
              <div className="modal-content" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6' }}>
                  <h5 className="modal-title" style={{ color: '#333333' }}>Update Payment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowUpdateModal(false)}
                    disabled={loading}
                  ></button>
                </div>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger" style={{ backgroundColor: '#ffffff', border: '2px solid #dc3545', color: '#dc3545' }}>
                      {formError}
                    </div>
                  )}
                  <form onSubmit={handleUpdate}>
                    <div className="mb-3">
                      <label htmlFor="amount" className="form-label" style={{ color: '#333333' }}>
                        Amount
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="amount"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                        required
                        disabled
                        style={{ backgroundColor: '#e9ecef', color: '#333333' }}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="month" className="form-label" style={{ color: '#333333' }}>
                        Month
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="month"
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                        required
                        placeholder="january, february, march...etc."
                        style={{ color: '#333333' }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || currentAmount === null}
                      style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
                    >
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
              <div className="modal-content" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6' }}>
                  <h5 className="modal-title" style={{ color: '#333333' }}>Confirm Delete</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={loading}
                  ></button>
                </div>
                <div className="modal-body" style={{ color: '#333333' }}>
                  <p>Are you sure you want to delete this payment for {selectedPayment.month}?</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={loading}
                    style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={loading}
                    style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
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