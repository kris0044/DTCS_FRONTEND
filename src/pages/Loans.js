import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getLoans, updateLoan, deleteLoan, requestLoan } from '../services/api';
import Header from './Header';
import Sidebar from './Sidebar';

const Loans = () => {
  const [role, setRole] = useState('');
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loansPerPage] = useState(10);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    status: 'pending',
    interestRate: '',
    duration: '',
    loanAmount: '',
    loanReason: '',
    emiStartDate: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLoans(currentPage, loansPerPage);
      const fetchedLoans = Array.isArray(res.data.loans) ? res.data.loans : [];
      setLoans(fetchedLoans);
      setFilteredLoans(fetchedLoans);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch loans');
      console.error('Fetch Loans Error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  }, [currentPage, loansPerPage]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const user = jwtDecode(token).user;
      console.log('Decoded user:', { id: user.id, role: user.role });
      setRole(user.role);
      fetchLoans();
    } catch (err) {
      console.error('Token Decode Error:', err.stack);
      setError('Invalid token, please log in again');
      navigate('/login');
    }
  }, [navigate, fetchLoans]);

  useEffect(() => {
    console.log('formData changed:', formData);
  }, [formData]);

  useEffect(() => {
    const filtered = loans.filter(loan => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      const userName = role === 'admin' && loan.user?.name ? loan.user.name.toLowerCase() : '';
      const amount = Number(loan.amount).toFixed(2).toString();
      const reason = loan.reason ? loan.reason.toLowerCase() : '';
      const status = loan.status ? loan.status.toLowerCase() : '';
      return userName.includes(query) || amount.includes(query) || reason.includes(query) || status.includes(query);
    });
    setFilteredLoans(filtered);
  }, [searchQuery, loans, role]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowUpdate = (loan) => {
    setSelectedLoan(loan);
    let initialStatus = 'pending';
    if (typeof loan.status === 'string' && ['approved', 'rejected', 'pending', 'completed'].includes(loan.status.toLowerCase())) {
      initialStatus = loan.status.toLowerCase();
    } else if (typeof loan.status === 'object' && loan.status !== null && typeof loan.status.status === 'string') {
      initialStatus = ['approved', 'rejected', 'pending', 'completed'].includes(loan.status.status.toLowerCase())
        ? loan.status.status.toLowerCase()
        : 'pending';
    }
    setFormData({
      status: initialStatus,
      interestRate: (typeof loan.status === 'object' && loan.status !== null && loan.status.interestRate) || loan.interestRate || '',
      duration: (typeof loan.status === 'object' && loan.status !== null && loan.status.duration) || loan.duration || '',
      loanAmount: '',
      loanReason: '',
      emiStartDate: loan.payments && loan.payments.length > 0 ? new Date(loan.payments[0].date).toISOString().split('T')[0] : '',
    });
    setFormError('');
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setFormData({ status: 'pending', interestRate: '', duration: '', loanAmount: '', loanReason: '', emiStartDate: '' });
    setFormError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const validStatuses = ['approved', 'rejected', 'pending', 'completed'];
    if (!formData.status || typeof formData.status !== 'string' || !validStatuses.includes(formData.status)) {
      console.error('Invalid status in formData:', formData.status);
      setFormError('Please select a valid status (Pending, Approved, Rejected, or Completed)');
      return;
    }
    if (formData.status === 'approved' && (!formData.interestRate || !formData.duration || !formData.emiStartDate)) {
      console.error('Missing required fields for approval:', { interestRate: formData.interestRate, duration: formData.duration, emiStartDate: formData.emiStartDate });
      setFormError('Interest rate, duration, and EMI start date are required for approval');
      return;
    }
    setLoading(true);
    const payload = {
      status: formData.status,
      ...(formData.interestRate && { interestRate: parseFloat(formData.interestRate) }),
      ...(formData.duration && { duration: parseInt(formData.duration, 10) }),
      ...(formData.emiStartDate && { emiStartDate: new Date(formData.emiStartDate).toISOString() }),
    };
    console.log('Sending updateLoan request:', payload);
    try {
      const response = await updateLoan(selectedLoan._id, payload);
      console.log('Update Loan Response:', response.data);
      handleCloseUpdateModal();
      fetchLoans();
    } catch (err) {
      console.error('Update Loan Error:', err.response?.data);
      setFormError(err.response?.data?.msg || 'Failed to update loan');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDelete = (loan) => {
    setSelectedLoan(loan);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteLoan(selectedLoan._id);
      setShowDeleteModal(false);
      fetchLoans();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete loan');
      console.error('Delete Loan Error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // const handleApproveLoan = async (id) => {
  //   setLoading(true);
  //   const payload = { 
  //     status: 'approved', 
  //     interestRate: parseFloat(formData.interestRate) || 5, // Default to 5% if not provided
  //     duration: parseInt(formData.duration, 10) || 12, // Default to 12 months if not provided
  //     emiStartDate: formData.emiStartDate || new Date().toISOString().split('T')[0], // Default to today if not provided
  //   };
  //   console.log('Sending approveLoan request:', payload);
  //   try {
  //     const response = await updateLoan(id, payload);
  //     console.log('Approve Loan Response:', response.data);
  //     fetchLoans();
  //   } catch (err) {
  //     console.error('Approve Loan Error:', err.response?.data);
  //     setError(err.response?.data?.msg || 'Failed to approve loan');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleRejectLoan = async (id) => {
  //   setLoading(true);
  //   const payload = { status: 'rejected' };
  //   console.log('Sending rejectLoan request:', payload);
  //   try {
  //     const response = await updateLoan(id, payload);
  //     console.log('Reject Loan Response:', response.data);
  //     fetchLoans();
  //   } catch (err) {
  //     console.error('Reject Loan Error:', err.response?.data);
  //     setError(err.response?.data?.msg || 'Failed to reject loan');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleRequestLoan = async (e) => {
    e.preventDefault();
    if (!formData.loanAmount || !formData.loanReason) {
      setFormError('All loan fields are required');
      return;
    }
    if (formData.loanAmount <= 0) {
      setFormError('Loan amount must be positive');
      return;
    }
    setLoading(true);
    try {
      await requestLoan({ amount: parseFloat(formData.loanAmount), reason: formData.loanReason });
      setFormData({ ...formData, loanAmount: '', loanReason: '' });
      fetchLoans();
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Loan request failed');
      console.error('Request Loan Error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      case 'completed':
        return 'bg-primary';
      case 'pending':
      default:
        return 'bg-warning';
    }
  };

  const totalPages = Math.ceil(total / loansPerPage);

  return (
    <div className="d-flex" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Sidebar role={role} />
      <div className="flex-grow-1">
        <Header role={role} onLogout={handleLogout} />
        <div className="container mt-4 p-4">
          <h2 className="mb-4" style={{ color: '#333333' }}>Loan Management</h2>
          {error && (
            <div className="alert alert-danger" style={{ color: '#333333' }}>{error}</div>
          )}

          {/* Request Loan Section for Staff */}
          {role === 'staff' && (
            <div className="card mb-4 shadow" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
              <div className="card-body">
                <h3 className="card-title" style={{ color: '#333333' }}>Request Loan</h3>
                {formError && <div className="alert alert-danger" style={{ color: '#333333' }}>{formError}</div>}
                <form onSubmit={handleRequestLoan}>
                  <div className="mb-3">
                    <label htmlFor="loanAmount" className="form-label" style={{ color: '#333333' }}>Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="loanAmount"
                      name="loanAmount"
                      value={formData.loanAmount}
                      onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                      style={{ color: '#333333', backgroundColor: '#ffffff' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="loanReason" className="form-label" style={{ color: '#333333' }}>Reason</label>
                    <input
                      type="text"
                      className="form-control"
                      id="loanReason"
                      name="loanReason"
                      value={formData.loanReason}
                      onChange={(e) => setFormData({ ...formData, loanReason: e.target.value })}
                      placeholder="Enter reason"
                      style={{ color: '#333333', backgroundColor: '#ffffff' }}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading}
                    style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
                  >
                    {loading ? 'Submitting...' : 'Request Loan'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              className="form-control"
              placeholder={role === 'admin' ? "Search by user, amount, reason, or status" : "Search by amount, reason, or status"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ color: '#333333', backgroundColor: '#ffffff', borderRadius: '10px' }}
            />
          </div>

          {/* Loan List */}
          <div className="card shadow" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
            <div className="card-body">
              <h3 className="card-title" style={{ color: '#333333' }}>{role === 'admin' ? 'All Loans' : 'My Loans'}</h3>
              {loading && <div className="alert alert-info" style={{ color: '#333333', backgroundColor: '#e9ecef' }}>Loading...</div>}
              {filteredLoans.length === 0 && !loading ? (
                <p style={{ color: '#333333' }}>No loans found</p>
              ) : (
                <>
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        {role === 'admin' && <th style={{ color: '#333333' }}>User</th>}
                        <th style={{ color: '#333333' }}>Amount (₹)</th>
                        <th style={{ color: '#333333' }}>Reason</th>
                        <th style={{ color: '#333333' }}>Interest Rate (%)</th>
                        <th style={{ color: '#333333' }}>Duration (Months)</th>
                        <th style={{ color: '#333333' }}>Total Payable (₹)</th>
                        <th style={{ color: '#333333' }}>Status</th>
                        <th style={{ color: '#333333' }}>Date</th>
                        <th style={{ color: '#333333' }}>Details</th>
                        {role === 'admin' && <th style={{ color: '#333333' }}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLoans.map((loan) => (
                        <tr key={loan._id}>
                          {role === 'admin' && <td style={{ color: '#333333' }}>{loan.user?.name || 'Unknown'}</td>}
                          <td style={{ color: '#333333' }}>{Number(loan.amount).toFixed(2)}</td>
                          <td style={{ color: '#333333' }}>{loan.reason}</td>
                          <td style={{ color: '#333333' }}>{loan.interestRate ? Number(loan.interestRate).toFixed(2) : 'N/A'}</td>
                          <td style={{ color: '#333333' }}>{loan.duration || 'N/A'}</td>
                          <td style={{ color: '#333333' }}>{loan.totalAmountPayable ? Number(loan.totalAmountPayable).toFixed(2) : 'N/A'}</td>
                          <td>
                            <span
                              className={`badge ${getStatusBadgeClass(loan.status)} text-white`}
                            >
                              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                            </span>
                          </td>
                          <td style={{ color: '#333333' }}>{new Date(loan.date).toLocaleDateString()}</td>
                          <td>
                            <Link 
                              to={`/loans/${loan._id}`} 
                              className="btn btn-sm btn-info"
                              style={{ backgroundColor: '#17a2b8', borderColor: '#17a2b8' }}
                            >
                              View Details
                            </Link>
                          </td>
                          {role === 'admin' && (
                            <td>
                              {/* {loan.status === 'pending' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success me-1"
                                    onClick={() => handleApproveLoan(loan._id)}
                                    disabled={loading}
                                    title="Approve"
                                    style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger me-1"
                                    onClick={() => handleRejectLoan(loan._id)}
                                    disabled={loading}
                                    title="Reject"
                                    style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )} */}
                              <button
                                className="btn btn-sm btn-primary me-1"
                                onClick={() => handleShowUpdate(loan)}
                                disabled={loading}
                                title="Edit"
                                style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger me-1"
                                onClick={() => handleShowDelete(loan)}
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
                  <nav>
                    <ul className="pagination justify-content-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(page)} 
                            disabled={loading}
                            style={{ color: '#333333', backgroundColor: currentPage === page ? '#007bff' : '#ffffff' }}
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

        {/* Update Modal */}
        {showUpdateModal && role === 'admin' && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
            {console.log('Current formData:', formData)}
            <div className="modal-dialog" role="document">
              <div className="modal-content" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
                <div className="modal-header">
                  <h5 className="modal-title" style={{ color: '#333333' }}>Update Loan</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={handleCloseUpdateModal} 
                    disabled={loading}
                  ></button>
                </div>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger" style={{ color: '#333333' }}>{formError}</div>}
                  <form onSubmit={handleUpdate}>
                    <div className="mb-3">
                      <label htmlFor="status" className="form-label" style={{ color: '#333333' }}>Status</label>
                      <select
                        className="form-control"
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        required
                        style={{ color: '#333333', backgroundColor: '#ffffff' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="interestRate" className="form-label" style={{ color: '#333333' }}>Interest Rate (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="interestRate"
                        value={formData.interestRate}
                        onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                        min="0"
                        step="0.1"
                        placeholder="Enter interest rate (required for approval)"
                        style={{ color: '#333333', backgroundColor: '#ffffff' }}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="duration" className="form-label" style={{ color: '#333333' }}>Duration (Months)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        min="1"
                        placeholder="Enter duration in months (required for approval)"
                        style={{ color: '#333333', backgroundColor: '#ffffff' }}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="emiStartDate" className="form-label" style={{ color: '#333333' }}>EMI Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="emiStartDate"
                        value={formData.emiStartDate}
                        onChange={(e) => setFormData({ ...formData, emiStartDate: e.target.value })}
                        placeholder="Select EMI start date (required for approval)"
                        style={{ color: '#333333', backgroundColor: '#ffffff' }}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={loading}
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
        {showDeleteModal && role === 'admin' && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
                <div className="modal-header">
                  <h5 className="modal-title" style={{ color: '#333333' }}>Confirm Delete</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={loading}
                  ></button>
                </div>
                <div className="modal-body">
                  <p style={{ color: '#333333' }}>Are you sure you want to delete this loan for ₹{selectedLoan.amount ? Number(selectedLoan.amount).toFixed(2) : 'N/A'}?</p>
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

export default Loans;