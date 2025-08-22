import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`bg-light border-end ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 h-screen fixed top-0 left-0 overflow-y-auto`}>
      <div className="p-3">
        <button
          className="btn btn-outline-primary w-100 mb-3"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? '☰' : '✕'}
        </button>
        {!isCollapsed && (
          <ul className="nav flex-column">
            {role === 'admin' && (
              <li className="nav-item">
                <NavLink
                  to="/Dashboard"
                  className={({ isActive }) => `nav-link ${isActive ? 'active text-primary fw-bold' : 'text-dark'}`}
                >
                  Dashboard
                </NavLink>
              </li>
            )}

             {role === 'admin' && (
              <li className="nav-item">
                <NavLink
                  to="/users"
                  className={({ isActive }) => `nav-link ${isActive ? 'active text-primary fw-bold' : 'text-dark'}`}
                >
                  Users
                </NavLink>
              </li>
            )}
            <li className="nav-item">
              <NavLink
                to="/loans"
                className={({ isActive }) => `nav-link ${isActive ? 'active text-primary fw-bold' : 'text-dark'}`}
              >
                Loans
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/payments"
                className={({ isActive }) => `nav-link ${isActive ? 'active text-primary fw-bold' : 'text-dark'}`}
              >
                Payments
              </NavLink>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;