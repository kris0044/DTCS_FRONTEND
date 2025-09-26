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
    <div className="min-vh-100 bg-primary d-flex align-items-center justify-content-center p-4" style={{ backgroundColor: '#3097ffa5' }}>
      <form onSubmit={handleSubmit} className="card shadow-lg p-4" style={{ borderRadius: '20px', maxWidth: '800px', width: '100%', transform: 'translateY(-50px)', backgroundColor: '#3097ffa5' }} encType="multipart/form-data">
        <div className="text-center mb-4">
          <div className="bg-secondary rounded-circle mx-auto" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg className="text-white" width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
        </div>
        <h2 className="text-center text-white mb-4">REGISTER</h2>
        {error && <div className="alert alert-danger text-center">{error}</div>}
        {success && <div className="alert alert-success text-center">{success}</div>}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="name" className="form-label text-white">NAME</label>
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
            <label htmlFor="email" className="form-label text-white">EMAIL</label>
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
            <label htmlFor="password" className="form-label text-white">PASSWORD</label>
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
          <div className="col-md-6 mb-3">
            <label htmlFor="address" className="form-label text-white">ADDRESS</label>
            <textarea
              className="form-control"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="phoneNumber" className="form-label text-white">PHONE NUMBER</label>
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
          <div className="col-md-6 mb-3">
            <label htmlFor="designation" className="form-label text-white">DESIGNATION</label>
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
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="dateOfJoining" className="form-label text-white">DATE OF JOINING</label>
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
            <label htmlFor="department" className="form-label text-white">DEPARTMENT</label>
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
            <label htmlFor="qualification" className="form-label text-white">QUALIFICATION</label>
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
            <label htmlFor="photo" className="form-label text-white">PHOTO (OPTIONAL)</label>
            <input
              type="file"
              className="form-control"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="nominee" className="form-label text-white">NOMINEE</label>
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
          <div className="col-md-6 mb-3">
            <label htmlFor="dateOfSocietyJoining" className="form-label text-white">DATE OF SOCIETY JOINING</label>
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
        <button
          type="submit"
          className="btn w-100 mb-3"
          style={{ backgroundColor: '#3498db', color: '#fff', borderRadius: '10px', padding: '10px', fontSize: '1rem', transition: 'background-color 0.3s' }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#00d9ffff')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#3498db')}
        >
          REGISTER
        </button>
        <p className="text-center text-white mb-2"></p>
        <p className="text-center text-info">
          Already have an account? <a href="/login" className="text-white fw-bold">LOGIN</a>
        </p>
      </form>
    </div>
  );
};

export default Register;