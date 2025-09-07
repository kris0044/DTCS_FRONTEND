import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Header from './Header';
import Sidebar from './Sidebar';
import { getMeetings, addMeeting, updateMeeting, deleteMeeting } from '../services/api';

const Meetings = () => {
  const [role, setRole] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [meetingsPerPage] = useState(10);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', time: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getMeetings({ params: { page: currentPage, limit: meetingsPerPage } });
      console.log('API Response:', data);
      const meetingsData = Array.isArray(data.meetings) ? data.meetings : [];
      setMeetings(meetingsData);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch Meetings Error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        setError('Session expired, please log in again');
      } else {
        setError(err.response?.data?.msg || 'Failed to fetch meetings');
      }
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, meetingsPerPage, navigate]);

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
      fetchMeetings();
    } catch (err) {
      console.error('Token decode error:', err);
      setError('Invalid token, please log in again');
      navigate('/login');
    }
  }, [navigate, fetchMeetings]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleShowCreate = () => {
    setFormData({ title: '', description: '', date: '', time: '' });
    setFormError('');
    setShowCreateModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.date || !formData.time) {
      setFormError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await addMeeting(formData);
      setShowCreateModal(false);
      fetchMeetings();
    } catch (err) {
      console.error('Create Meeting Error:', err);
      setFormError(err.response?.data?.msg || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleShowUpdate = (meeting) => {
    setSelectedMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description,
      date: meeting.date.split('T')[0],
      time: meeting.time,
    });
    setFormError('');
    setShowUpdateModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.date || !formData.time) {
      setFormError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await updateMeeting(selectedMeeting._id, formData);
      setShowUpdateModal(false);
      fetchMeetings();
    } catch (err) {
      console.error('Update Meeting Error:', err);
      setFormError(err.response?.data?.msg || 'Failed to update meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDelete = (meeting) => {
    setSelectedMeeting(meeting);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteMeeting(selectedMeeting._id);
      setShowDeleteModal(false);
      fetchMeetings();
    } catch (err) {
      console.error('Delete Meeting Error:', err);
      setError(err.response?.data?.msg || 'Failed to delete meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const totalPages = Math.ceil(total / meetingsPerPage);

  return (
    <div className="d-flex">
      <Sidebar role={role} />
      <div className="flex-grow-1">
        <Header role={role} onLogout={handleLogout} />
        <div className="container mt-4">
          <h2 className="mb-4">Meeting Management</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="card shadow">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="card-title">All Meetings</h3>
                {role === 'admin' && (
                  <button className="btn btn-primary" onClick={handleShowCreate} disabled={loading}>
                    Schedule Meeting
                  </button>
                )}
              </div>
              {loading && <div className="alert alert-info">Loading...</div>}
              {meetings.length === 0 && !loading ? (
                <p>No meetings found</p>
              ) : (
                <>
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Time</th>
                        {role === 'admin' && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {meetings.map(meeting => (
                        <tr key={meeting._id}>
                          <td>{meeting.title}</td>
                          <td>{meeting.description}</td>
                          <td>{new Date(meeting.date).toLocaleDateString()}</td>
                          <td>{meeting.time}</td>
                          {role === 'admin' && (
                            <td>
                              <button
                                className="btn btn-sm btn-primary me-1"
                                onClick={() => handleShowUpdate(meeting)}
                                disabled={loading}
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger me-1"
                                onClick={() => handleShowDelete(meeting)}
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
                  <h5 className="modal-title">Schedule Meeting</h5>
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
                        placeholder="Meeting Title"
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
                        placeholder="Meeting Description"
                        rows="4"
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="date" className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="time" className="form-label">Time</label>
                      <input
                        type="time"
                        className="form-control"
                        id="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Submitting...' : 'Schedule Meeting'}
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
                  <h5 className="modal-title">Update Meeting</h5>
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
                        placeholder="Meeting Title"
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
                        placeholder="Meeting Description"
                        rows="4"
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="date" className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="time" className="form-label">Time</label>
                      <input
                        type="time"
                        className="form-control"
                        id="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Meeting'}
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
                  <p>Are you sure you want to delete the meeting "{selectedMeeting.title}"?</p>
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

export default Meetings;