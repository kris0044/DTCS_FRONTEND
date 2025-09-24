// src/components/MyProfile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getCurrentUser, updateUser } from '../services/api';
import userprofile from '../services/api';
const MyProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phoneNumber: '',
    designation: '',
    dateOfJoining: '',
    department: '',
    qualification: '',
    photo: null,
    nominee: '',
    dateOfSocietyJoining: '',
    role: '',
    isApproved: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setRole(decoded.user.role);
      fetchProfile();
    } catch (err) {
      setError('Invalid token, please log in again');
      navigate('/login');
    }
  }, [navigate]);

const fetchProfile = async () => {
  try {
    const res = await getCurrentUser();
    const user = res.data.user;
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      address: user.address || '',
      phoneNumber: user.phoneNumber || '',
      designation: user.designation || '',
      dateOfJoining: user.dateOfJoining ? new Date(user.dateOfJoining).toISOString().split('T')[0] : '',
      department: user.department || '',
      qualification: user.qualification || '',
      photo: null,
      nominee: user.nominee || '',
      dateOfSocietyJoining: user.dateOfSocietyJoining
        ? new Date(user.dateOfSocietyJoining).toISOString().split('T')[0]
        : '',
      role: user.role || 'staff',
      isApproved: user.isApproved || false,
    });
    // Normalize path separators and extract filename
    setPhotoUrl(user.photo ? `http://localhost:5000/uploads/${user.photo.replace(/\\/g, '/').split('/').pop()}` : '');
  } catch (err) {
    setError(err.response?.data?.msg || 'Failed to fetch profile');
  }
};

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
    setError('');
    setSuccess('');
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const {
    name,
    email,
    password,
    address,
    phoneNumber,
    designation,
    dateOfJoining,
    department,
    qualification,
    nominee,
    dateOfSocietyJoining,
    role,
    isApproved,
  } = formData;

  // Client-side validation
  if (!name || !email || !address || !phoneNumber || !designation || !department || !qualification || !nominee) {
    setError('All fields are required except password, photo, and admin-only fields');
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    setError('Invalid email format');
    return;
  }
  if (password && password.length < 6) {
    setError('Password must be at least 6 characters if provided');
    return;
  }
  if (!/^\d{10}$/.test(phoneNumber)) {
    setError('Phone number must be 10 digits');
    return;
  }
  if (dateOfJoining && new Date(dateOfJoining) > new Date()) {
    setError('Date of joining cannot be in the future');
    return;
  }
  if (dateOfSocietyJoining && new Date(dateOfSocietyJoining) > new Date()) {
    setError('Date of society joining cannot be in the future');
    return;
  }

  // Prepare form data for file upload
  const formDataToSend = new FormData();
  const fields = { name, email, address, phoneNumber, designation, dateOfJoining, department, qualification, nominee, dateOfSocietyJoining };
  if (password) fields.password = password;
  if (role && role === 'admin') fields.role = role;
  if (role === 'admin') fields.isApproved = isApproved;
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formDataToSend.append(key, value);
    }
  });
  if (formData.photo) {
    formDataToSend.append('photo', formData.photo);
  }

  try {
    await updateUser(formDataToSend); // Call without ID for self-update
    setSuccess('Profile updated successfully');
    fetchProfile();
  } catch (err) {
    setError(err.response?.data?.msg || 'Failed to update profile');
  }
};

  return (
    <div className="container mt-5 pt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">My Profile</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              {photoUrl && (
                <div className="text-center mb-4">
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="img-fluid rounded-circle"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                </div>
              )}
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div className="row">
                 
                  <div className="col-md-6 mb-3">
                    <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter 10-digit phone number"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="designation" className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      id="designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="Enter your designation"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="department" className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Enter your department"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="dateOfJoining" className="form-label">Date of Joining</label>
                    <input
                      type="date"
                      className="form-control"
                      id="dateOfJoining"
                      name="dateOfJoining"
                      value={formData.dateOfJoining}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="dateOfSocietyJoining" className="form-label">Date of Society Joining</label>
                    <input
                      type="date"
                      className="form-control"
                      id="dateOfSocietyJoining"
                      name="dateOfSocietyJoining"
                      value={formData.dateOfSocietyJoining}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="qualification" className="form-label">Qualification</label>
                    <input
                      type="text"
                      className="form-control"
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="Enter your qualification"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="nominee" className="form-label">Nominee</label>
                    <input
                      type="text"
                      className="form-control"
                      id="nominee"
                      name="nominee"
                      value={formData.nominee}
                      onChange={handleChange}
                      placeholder="Enter nominee name"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="photo" className="form-label">Update Photo (Optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    onChange={handleChange}
                  />
                </div>
                {role === 'admin' && (
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="role" className="form-label">Role</label>
                      <select
                        className="form-control"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="isApproved" className="form-label">Approved</label>
                      <select
                        className="form-control"
                        id="isApproved"
                        name="isApproved"
                        value={formData.isApproved}
                        onChange={handleChange}
                      >
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </select>
                    </div>
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-100">Update Profile</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;

