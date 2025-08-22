import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getAllUsers, approveUser, rejectUser, updateUser, deleteUser } from '../services/api';
import Header from './Header';
import Sidebar from './Sidebar';

const Users = () => {
  const [role, setRole] = useState('');
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'staff', isApproved: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllUsers(currentPage, usersPerPage);
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, usersPerPage]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const user = jwtDecode(token).user;
    setRole(user.role);
    if (user.role !== 'admin') {
      setError('Access denied. Admins only.');
      return;
    }
    fetchUsers();
  }, [navigate, fetchUsers]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowUpdate = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, isApproved: user.isApproved });
    setFormError('');
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and email are required');
      return;
    }
    setLoading(true);
    try {
      await updateUser(selectedUser._id, formData);
      setShowUpdateModal(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteUser(selectedUser._id);
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (id) => {
    setLoading(true);
    try {
      await approveUser(id);
      fetchUsers();
    } catch (err) {
      setError('Failed to approve user');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectUser = async (id) => {
    setLoading(true);
    try {
      await rejectUser(id);
      fetchUsers();
    } catch (err) {
      setError('Failed to reject user');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const totalPages = Math.ceil(total / usersPerPage);

  return (
    <div className="d-flex">
      <Sidebar role={role} />
      <div className="flex-grow-1">
        <Header role={role} onLogout={handleLogout} />
        <div className="container mt-4">
          <h2 className="mb-4">User Management</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {role !== 'admin' ? (
            <p className="text-muted">You do not have permission to view this page.</p>
          ) : (
            <div className="card shadow">
              <div className="card-body">
                <h3 className="card-title">All Users</h3>
                {loading && <div className="alert alert-info">Loading...</div>}
                {users.length === 0 && !loading ? (
                  <p>No users found</p>
                ) : (
                  <>
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                              <span className={`badge bg-${user.isApproved ? 'success' : 'warning'} text-white`}>
                                {user.isApproved ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td>
                              {!user.isApproved && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success me-1"
                                    onClick={() => handleApproveUser(user._id)}
                                    disabled={loading}
                                    title="Approve"
                                  >
✅                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger me-1"
                                    onClick={() => handleRejectUser(user._id)}
                                    disabled={loading}
                                    title="Reject"
                                  >
                                  ❌</button>
                                </>
                              )}
                              <i
                                  className="btn btn-sm btn-success me-1"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleShowUpdate(user)}
                                title="Edit"
                              >✎</i>
                              <i
                                className="btn btn-sm btn-danger me-1"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleShowDelete(user)}
                                title="Delete"
                              >🗑</i>
                            </td>
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
          )}
        </div>

        {/* Update Modal */}
        {showUpdateModal && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update User</h5>
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
                      <label htmlFor="name" className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="role" className="form-label">Role</label>
                      <select
                        className="form-control"
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isApproved"
                        checked={formData.isApproved}
                        onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="isApproved">Approved</label>
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
                  <p>Are you sure you want to delete {selectedUser.name}?</p>
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

export default Users;