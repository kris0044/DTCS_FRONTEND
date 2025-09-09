import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Invalid email format');
      return;
    }
    try {
      const { data } = await login(formData);
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="min-vh-100 bg-primary d-flex align-items-center justify-content-center p-4" style={{ backgroundColor: '#3097ffa5' }}>
      <form onSubmit={handleSubmit} className="card shadow-lg p-4" style={{ borderRadius: '20px', maxWidth: '400px', width: '100%', transform: 'translateY(-50px)', backgroundColor: '#3097ffa5' }}>
        <div className="text-center mb-4">
          <div className="bg-secondary rounded-circle mx-auto" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg className="text-white" width="48" height="48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
        </div>
        <h2 className="text-center text-white mb-4">LOGIN</h2>
        {error && <div className="alert alert-danger text-center">{error}</div>}
        <div className="mb-3">
          <label htmlFor="email" className="form-label text-white">USERNAME</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your username"
          />
        </div>
        <div className="mb-3">
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
        <div className="mb-2 form-check">
         
        </div>
        <button
          type="submit"
          className="btn w-100 mb-3"
          style={{ backgroundColor: '#3498db', color: '#fff', borderRadius: '10px', padding: '10px', fontSize: '1rem', transition: 'background-color 0.3s' }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#00d9ffff')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#00d9ffff')}
        >
          LOGIN
        </button>
        <p className="text-center text-white mb-2">
        </p>
        <p className="text-center text-info">
          Not a member? <a href="/register" className="text-white fw-bold">CREATE ACCOUNT</a>
        </p>
      </form>
    </div>
  );
};

export default Login;