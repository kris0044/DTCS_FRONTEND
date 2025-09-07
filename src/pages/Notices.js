import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Header from './Header';
import Sidebar from './Sidebar';
import { getNotices, addNotice, updateNotice, deleteNotice } from '../services/api';

const Notices = () => {
  const [role, setRole] = useState('');
  const [notices, setNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [noticesPerPage] = useState(10);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getNotices({ params: { page: currentPage, limit: noticesPerPage } });
      console.log('API Response:', data);
      const noticesData = Array.isArray(data.notices) ? data.notices : [];
      setNotices(noticesData);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch Notices Error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        setError('Session expired, please log in again');
      } else {
        setError(err.response?.data?.msg || 'Failed to fetch notices');
      }
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, noticesPerPage, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const user = jwtDecode(token).user;
      console.log('Decoded user:', user);
      setRole(user.role);
      fetchNotices();
    } catch (err) {
      console.error('Token decode error:', err);
      setError('Invalid token, please log in again');
      navigate('/login');
    }
  }, [navigate, fetchNotices]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowCreate = () => {
    setFormData({ title: '', description: '' });
    setFormError('');
    setShowCreateModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Title and description are required');
      return;
    }
    setLoading(true);
    try {
      await addNotice(formData);
      setShowCreateModal(false);
      fetchNotices();
    } catch (err) {
      console.error('Create Notice Error:', err);
      setFormError(err.response?.data?.msg || 'Failed to create notice');
    } finally {
      setLoading(false);
    }
  };

  const handleShowUpdate = (notice) => {
    setSelectedNotice(notice);
    setFormData({ title: notice.title, description: notice.description });
    setFormError('');
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Title and description are required');
      return;
    }
    setLoading(true);
    try {
      await updateNotice(selectedNotice._id, formData);
      setShowUpdateModal(false);
      fetchNotices();
    } catch (err) {
      console.error('Update Notice Error:', err);
      setFormError(err.response?.data?.msg || 'Failed to update notice');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDelete = (notice) => {
    setSelectedNotice(notice);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteNotice(selectedNotice._id);
      setShowDeleteModal(false);
      fetchNotices();
    } catch (err) {
      console.error('Delete Notice Error:', err);
      setError(err.response?.data?.msg || 'Failed to delete notice');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const totalPages = Math.ceil(total / noticesPerPage);

  return (
    <div className="d-flex">
      <Sidebar role={role} />
      <div className="flex-grow-1">
        <Header role={role} onLogout={handleLogout} />
        <div className="container mt-4">
          <h2 className="mb-4">Notice Management</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="card shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="card-title">All Notices</h3>
                {role === 'admin' && (
                  <button className="btn btn-primary" onClick={handleShowCreate} disabled={loading}>
                    Create Notice
                  </button>
                )}
              </div>
              {loading && <div className="alert alert-info">Loading...</div>}
              {notices.length === 0 && !loading ? (
                <p>No notices found</p>
              ) : (
                <>
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Date</th>
                        {role === 'admin' && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {notices.map(notice => (
                        <tr key={notice._id}>
                          <td>{notice.title}</td>
                          <td>{notice.description}</td>
                          <td>{new Date(notice.date).toLocaleDateString()}</td>
                          {role === 'admin' && (
                            <td>
                              <button
                                className="btn btn-sm btn-primary me-1"
                                onClick={() => handleShowUpdate(notice)}
                                disabled={loading}
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger me-1"
                                onClick={() => handleShowDelete(notice)}
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
                  <h5 className="modal-title">Create Notice</h5>
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
                      <label htmlFor="title" className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="Notice Title"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        placeholder="Notice Description"
                        rows="4"
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Notice'}
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
                  <h5 className="modal-title">Update Notice</h5>
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
                      <label htmlFor="title" className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="Notice Title"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        placeholder="Notice Description"
                        rows="4"
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Notice'}
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
                  <p>Are you sure you want to delete the notice "{selectedNotice.title}"?</p>
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

export default Notices;