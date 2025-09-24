// Frontend: src/components/Resignations.jsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getResignations, updateResignation, deleteResignation, requestResignation } from '../services/api';
import Header from './Header';
import Sidebar from './Sidebar';

const Resignations = () => {
  const [role, setRole] = useState('');
  const [resignations, setResignations] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resignationsPerPage] = useState(10);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResignation, setSelectedResignation] = useState(null);
  const [formData, setFormData] = useState({
    status: 'pending',
    reason: '',
    leavingDate: '',
    feedback: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchResignations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getResignations(currentPage, resignationsPerPage);
      setResignations(Array.isArray(res.data.resignations) ? res.data.resignations : []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch resignations');
    } finally {
      setLoading(false);
    }
  }, [currentPage, resignationsPerPage]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const user = jwtDecode(token).user;
      setRole(user.role);
      fetchResignations();
    } catch (err) {
      console.error('Token Decode Error:', err.stack);
      setError('Invalid token, please log in again');
      navigate('/login');
    }
  }, [navigate, fetchResignations]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowUpdate = (resignation) => {
    setSelectedResignation(resignation);
    let initialStatus = 'pending';
    if (typeof resignation.status === 'string' && ['approved', 'rejected', 'pending'].includes(resignation.status.toLowerCase())) {
      initialStatus = resignation.status.toLowerCase();
    }
    setFormData({
      status: initialStatus,
      reason: resignation.reason || '',
      leavingDate: resignation.leavingDate ? new Date(resignation.leavingDate).toISOString().split('T')[0] : '',
      feedback: resignation.feedback || '',
    });
    setFormError('');
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setFormData({ status: 'pending', reason: '', leavingDate: '', feedback: '' });
    setFormError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const validStatuses = ['approved', 'rejected', 'pending'];
    if (!formData.status || typeof formData.status !== 'string' || !validStatuses.includes(formData.status)) {
      setFormError('Please select a valid status (Pending, Approved, Rejected)');
      return;
    }
    setLoading(true);
    const payload = {
      status: formData.status,
      reason: formData.reason,
      leavingDate: formData.leavingDate,
      feedback: formData.feedback,
    };
    try {
      await updateResignation(selectedResignation._id, payload);
      handleCloseUpdateModal();
      fetchResignations();
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Failed to update resignation');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDelete = (resignation) => {
    setSelectedResignation(resignation);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteResignation(selectedResignation._id);
      setShowDeleteModal(false);
      fetchResignations();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete resignation');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveResignation = async (id) => {
    setLoading(true);
    try {
      await updateResignation(id, { status: 'approved' });
      fetchResignations();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to approve resignation');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectResignation = async (id) => {
    setLoading(true);
    try {
      await updateResignation(id, { status: 'rejected' });
      fetchResignations();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reject resignation');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResignation = async (e) => {
    e.preventDefault();
    if (!formData.reason || !formData.leavingDate) {
      setFormError('Reason and leaving date are required');
      return;
    }
    setLoading(true);
    try {
      await requestResignation({
        reason: formData.reason,
        leavingDate: formData.leavingDate,
        feedback: formData.feedback,
      });
      setFormData({ reason: '', leavingDate: '', feedback: '' });
      fetchResignations();
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Resignation request failed');
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
      case 'pending':
      default:
        return 'bg-warning';
    }
  };

  const totalPages = Math.ceil(total / resignationsPerPage);

  return (
    <div className="d-flex">
      <Sidebar role={role} />
      <div className="flex-grow-1">
        <Header role={role} onLogout={handleLogout} />
        <div className="container mt-4">
          <h2 className="mb-4">Resignation Management</h2>
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Request Resignation Section for Staff */}
          {role === 'staff' && (
            <div className="card mb-4 shadow">
              <div className="card-body">
                <h3 className="card-title">Apply for Resignation</h3>
                {formError && <div className="alert alert-danger">{formError}</div>}
                <form onSubmit={handleRequestResignation}>
                  <div className="mb-3">
                    <label htmlFor="reason" className="form-label">Reason for Resignation</label>
                    <textarea
                      className="form-control"
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Enter reason"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="leavingDate" className="form-label">Leaving Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="leavingDate"
                      name="leavingDate"
                      value={formData.leavingDate}
                      onChange={(e) => setFormData({ ...formData, leavingDate: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="feedback" className="form-label">Additional Feedback (Optional)</label>
                    <textarea
                      className="form-control"
                      id="feedback"
                      name="feedback"
                      value={formData.feedback}
                      onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                      placeholder="Enter any additional feedback"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Resignation'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Resignation List */}
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title">{role === 'admin' ? 'All Resignations' : 'My Resignations'}</h3>
              {loading && <div className="alert alert-info">Loading...</div>}
              {resignations.length === 0 && !loading ? (
                <p>No resignations found</p>
              ) : (
                <>
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        {role === 'admin' && <th>User</th>}
                        <th>Reason</th>
                        <th>Leaving Date</th>
                        <th>Feedback</th>
                        <th>Status</th>
                        <th>Submission Date</th>
                        <th>Details</th>
                        {role === 'admin' && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {resignations.map((resignation) => (
                        <tr key={resignation._id}>
                          {role === 'admin' && <td>{resignation.user?.name || 'Unknown'}</td>}
                          <td>{resignation.reason}</td>
                          <td>{resignation.leavingDate ? new Date(resignation.leavingDate).toLocaleDateString() : 'N/A'}</td>
                          <td>{resignation.feedback || 'N/A'}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(resignation.status)} text-white`}>
                              {resignation.status.charAt(0).toUpperCase() + resignation.status.slice(1)}
                            </span>
                          </td>
                          <td>{new Date(resignation.date).toLocaleDateString()}</td>
                          <td>
                            <Link to={`/resignations/${resignation._id}`} className="btn btn-sm btn-info">
                              View Details
                            </Link>
                          </td>
                          {role === 'admin' && (
                            <td>
                              {resignation.status === 'pending' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success me-1"
                                    onClick={() => handleApproveResignation(resignation._id)}
                                    disabled={loading}
                                    title="Approve"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger me-1"
                                    onClick={() => handleRejectResignation(resignation._id)}
                                    disabled={loading}
                                    title="Reject"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                className="btn btn-sm btn-primary me-1"
                                onClick={() => handleShowUpdate(resignation)}
                                disabled={loading}
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger me-1"
                                onClick={() => handleShowDelete(resignation)}
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
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Resignation</h5>
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
                      <label htmlFor="reason" className="form-label">Reason</label>
                      <textarea
                        className="form-control"
                        id="reason"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="Enter reason"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="leavingDate" className="form-label">Leaving Date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="leavingDate"
                        value={formData.leavingDate}
                        onChange={(e) => setFormData({ ...formData, leavingDate: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="feedback" className="form-label">Feedback</label>
                      <textarea
                        className="form-control"
                        id="feedback"
                        value={formData.feedback}
                        onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                        placeholder="Enter feedback (optional)"
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
                  <p>Are you sure you want to delete this resignation?</p>
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

export default Resignations;