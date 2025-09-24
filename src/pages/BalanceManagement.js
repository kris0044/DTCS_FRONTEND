import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getBalanceEntries, createBalanceEntry, updateBalanceEntry, deleteBalanceEntry } from '../services/api';
import Header from './Header';
import Sidebar from './Sidebar';

const BalanceManagement = () => {
  const [role, setRole] = useState('');
  const [entries, setEntries] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [newAmount, setNewAmount] = useState('');
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingAmount, setEditingAmount] = useState('');
  const [editingNote, setEditingNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const user = jwtDecode(token).user;
      setRole(user.role);
      if (user.role !== 'admin') {
        navigate('/dashboard');
      } else {
        fetchBalanceEntries();
      }
    } catch (err) {
      console.error('Token Decode Error:', err.stack);
      setError('Invalid token, please log in again');
      navigate('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchBalanceEntries = async () => {
    setLoading(true);
    try {
      const res = await getBalanceEntries();
      setEntries(res.data.entries);
      setTotalBalance(res.data.totalBalance);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch balance entries');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    try {
      setLoading(true);
      const res = await createBalanceEntry({ amount: parseFloat(newAmount), note: newNote });
      setEntries([...entries, res.data.entry]);
      setTotalBalance(res.data.totalBalance);
      setNewAmount('');
      setNewNote('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create balance entry');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (entry) => {
    setEditingId(entry._id);
    setEditingAmount(entry.amount);
    setEditingNote(entry.note);
  };

  const handleUpdateEntry = async () => {
    try {
      setLoading(true);
      const res = await updateBalanceEntry(editingId, { amount: parseFloat(editingAmount), note: editingNote });
      setEntries(entries.map(e => e._id === editingId ? res.data.entry : e));
      setTotalBalance(res.data.totalBalance);
      setEditingId(null);
      setEditingAmount('');
      setEditingNote('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update balance entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        setLoading(true);
        const res = await deleteBalanceEntry(id);
        setEntries(entries.filter(e => e._id !== id));
        setTotalBalance(res.data.totalBalance);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to delete balance entry');
      } finally {
        setLoading(false);
      }
    }
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
          <h2 className="mb-4">Balance Management</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {loading && <div className="alert alert-info">Loading...</div>}
          <div className="card shadow mb-4">
            <div className="card-body">
              <h4>Total Balance: ₹{totalBalance.toFixed(2)}</h4>
            </div>
          </div>
          <div className="card shadow mb-4">
            <div className="card-body">
              <h4>Add New Balance Entry</h4>
              <div className="form-group">
                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Amount"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Note (optional)"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleCreateEntry}
                  disabled={loading || !newAmount}
                >
                  Add Entry
                </button>
              </div>
            </div>
          </div>
          <h4 className="mt-4">Balance Entries</h4>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Amount (₹)</th>
                <th>Note</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id}>
                  {editingId === entry._id ? (
                    <>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={editingAmount}
                          onChange={(e) => setEditingAmount(e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={editingNote}
                          onChange={(e) => setEditingNote(e.target.value)}
                        />
                      </td>
                      <td>{new Date(entry.date).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={handleUpdateEntry}
                          disabled={loading || !editingAmount}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingId(null)}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{entry.amount.toFixed(2)}</td>
                      <td>{entry.note || 'N/A'}</td>
                      <td>{new Date(entry.date).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleStartEdit(entry)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteEntry(entry._id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BalanceManagement;