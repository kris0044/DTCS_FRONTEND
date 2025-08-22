import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ role, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-primary text-white p-3 shadow">
      <div className="container d-flex justify-content-between align-items-center">
        <h1 className="h4 mb-0">{role === 'admin' ? 'Admin' : 'Staff'} Dashboard</h1>
        <div className="dropdown">
          <button
            className="btn btn-outline-light dropdown-toggle"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Account
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu dropdown-menu-end show">
              <button className="dropdown-item" onClick={handleProfileClick}>
                My Profile
              </button>
              <button className="dropdown-item text-danger" onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;