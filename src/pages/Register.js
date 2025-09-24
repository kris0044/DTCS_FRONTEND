import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';

const Register = () => {
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
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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
    } = formData;

    if (!name || !email || !password || !address || !phoneNumber || !designation || !dateOfJoining || !department || !qualification || !nominee || !dateOfSocietyJoining) {
      setError('All fields are required except photo');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Phone number must be 10 digits');
      return;
    }
    if (new Date(dateOfJoining) > new Date()) {
      setError('Date of joining cannot be in the future');
      return;
    }
    if (new Date(dateOfSocietyJoining) > new Date()) {
      setError('Date of society joining cannot be in the future');
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'photo' && value) {
        formDataToSend.append('photo', value);
      } else if (value) {
        formDataToSend.append(key, value);
      }
    });

    try {
      await register(formDataToSend);
      setSuccess('Registration successful! Awaiting admin approval.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="container mt-5 pt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Register</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-3">
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
                <div className="mb-3">
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
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                  />
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
                <div className="mb-3">
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
                <div className="mb-3">
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
                <div className="mb-3">
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
                <div className="mb-3">
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
                <div className="mb-3">
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
                <div className="mb-3">
                  <label htmlFor="photo" className="form-label">Photo (Optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
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
                <div className="mb-3">
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
                <button type="submit" className="btn btn-primary w-100">Register</button>
              </form>
              <p className="text-center mt-3">
                Already have an account? <a href="/login">Login here</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;