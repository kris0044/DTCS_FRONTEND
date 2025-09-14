import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getLoans, updateLoan, deleteLoan, requestLoan } from '../services/api'; // Added requestLoan
import Header from './Header';
import Sidebar from './Sidebar';

const Loans = () => {
  const [role, setRole] = useState('');
  const [loans, setLoans] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loansPerPage] = useState(10);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [formData, setFormData] = useState({
    status: 'pending',
    interestRate: '',
    duration: '',
    loanAmount: '', // Added for loan request
    loanReason: '', // Added for loan request
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLoans(currentPage, loansPerPage);
      setLoans(Array.isArray(res.data.loans) ? res.data.loans : []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch loans');
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowUpdate = (loan) => {
    setSelectedLoan(loan);
    let initialStatus = 'pending';
    if (typeof loan.status === 'string' && ['approved', 'rejected', 'pending'].includes(loan.status.toLowerCase())) {
      initialStatus = loan.status.toLowerCase();
    } else if (typeof loan.status === 'object' && loan.status !== null && typeof loan.status.status === 'string') {
      initialStatus = ['approved', 'rejected', 'pending'].includes(loan.status.status.toLowerCase())
        ? loan.status.status.toLowerCase()
        : 'pending';
    }
    setFormData({
      ...formData,
      status: initialStatus,
      interestRate: (typeof loan.status === 'object' && loan.status !== null && loan.status.interestRate) || loan.interestRate || '',
      duration: (typeof loan.status === 'object' && loan.status !== null && loan.status.duration) || loan.duration || '',
    });
    setFormError('');
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setFormData({ ...formData, status: 'pending', interestRate: '', duration: '' });
    setFormError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const validStatuses = ['approved', 'rejected', 'pending'];
    if (!formData.status || typeof formData.status !== 'string' || !validStatuses.includes(formData.status)) {
      console.error('Invalid status in formData:', formData.status);
      setFormError('Please select a valid status (Pending, Approved, or Rejected)');
      return;
    }
    setLoading(true);
    const payload = {
      status: formData.status,
      ...(formData.interestRate && { interestRate: parseFloat(formData.interestRate) }),
      ...(formData.duration && { duration: parseInt(formData.duration, 10) }),
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
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLoan = async (id) => {
    setLoading(true);
    const payload = { status: 'approved' };
    console.log('Sending approveLoan request:', payload);
    try {
      const response = await updateLoan(id, payload);
      console.log('Approve Loan Response:', response.data);
      fetchLoans();
    } catch (err) {
      console.error('Approve Loan Error:', err.response?.data);
      setError(err.response?.data?.msg || 'Failed to approve loan');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectLoan = async (id) => {
    setLoading(true);
    const payload = { status: 'rejected' };
    console.log('Sending rejectLoan request:', payload);
    try {
      const response = await updateLoan(id, payload);
      console.log('Reject Loan Response:', response.data);
      fetchLoans();
    } catch (err) {
      console.error('Reject Loan Error:', err.response?.data);
      setError(err.response?.data?.msg || 'Failed to reject loan');
    } finally {
      setLoading(false);
    }
  };

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
      await requestLoan({ amount: formData.loanAmount, reason: formData.loanReason });
      setFormData({ ...formData, loanAmount: '', loanReason: '' });
      fetchLoans();
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Loan request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const totalPages = Math.ceil(total / loansPerPage);

  return (
    <div className="d-flex">
      <Sidebar role={role} />
      <div className="flex-grow-1">
        <Header role={role} onLogout={handleLogout} />
        <div className="container mt-4">
          <h2 className="mb-4">Loan Management</h2>
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Request Loan Section for Staff */}
          {role === 'staff' && (
            <div className="card mb-4 shadow">
              <div className="card-body">
                <h3 className="card-title">Request Loan</h3>
                {formError && <div className="alert alert-danger">{formError}</div>}
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
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Request Loan'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Loan List */}
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title">{role === 'admin' ? 'All Loans' : 'My Loans'}</h3>
              {loading && <div className="alert alert-info">Loading...</div>}
              {loans.length === 0 && !loading ? (
                <p>No loans found</p>
              ) : (
                <>
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        {role === 'admin' && <th>User</th>}
                        <th>Amount (₹)</th>
                        <th>Reason</th>
                        <th>Interest Rate (%)</th>
                        <th>Duration (Months)</th>
                        <th>Total Payable (₹)</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Details</th>
                        {role === 'admin' && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {loans.map((loan) => (
                        <tr key={loan._id}>
                          {role === 'admin' && <td>{loan.user?.name || 'Unknown'}</td>}
                          <td>{loan.amount}</td>
                          <td>{loan.reason}</td>
                          <td>{loan.interestRate || 'N/A'}</td>
                          <td>{loan.duration || 'N/A'}</td>
                          <td>{loan.totalAmountPayable ? loan.totalAmountPayable.toFixed(2) : 'N/A'}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                loan.status === 'approved' ? 'success' : loan.status === 'rejected' ? 'danger' : 'warning'
                              } text-white`}
                            >
                              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                            </span>
                          </td>
                          <td>{new Date(loan.date).toLocaleDateString()}</td>
                          <td>
                            <Link to={`/loans/${loan._id}`} className="btn btn-sm btn-info">
                              View Details
                            </Link>
                          </td>
                          {role === 'admin' && (
                            <td>
                              {loan.status === 'pending' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success me-1"
                                    onClick={() => handleApproveLoan(loan._id)}
                                    disabled={loading}
                                    title="Approve"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger me-1"
                                    onClick={() => handleRejectLoan(loan._id)}
                                    disabled={loading}
                                    title="Reject"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                className="btn btn-sm btn-primary me-1"
                                onClick={() => handleShowUpdate(loan)}
                                disabled={loading}
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger me-1"
                                onClick={() => handleShowDelete(loan)}
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => handlePageChange(page)} disabled={loading}>
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
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Loan</h5>
                  <button type="button" className="btn-close" onClick={handleCloseUpdateModal} disabled={loading}></button>
                </div>
                <div className="modal-body">
                  {formError && <div className="alert alert-danger">{formError}</div>}
                  <form onSubmit={handleUpdate}>
                    <div className="mb-3">
                      <label htmlFor="status" className="form-label">Status</label>
                      <select
                        className="form-control"
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="interestRate" className="form-label">Interest Rate (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="interestRate"
                        value={formData.interestRate}
                        onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                        min="0"
                        step="0.1"
                        placeholder="Enter interest rate (optional)"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="duration" className="form-label">Duration (Months)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        min="1"
                        placeholder="Enter duration in months (optional)"
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
        {showDeleteModal && role === 'admin' && (
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
                  <p>Are you sure you want to delete this loan for ₹{selectedLoan.amount}?</p>
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
                  <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
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