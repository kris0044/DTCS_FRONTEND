import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUsers, FaMoneyBill, FaCreditCard } from 'react-icons/fa';

const Sidebar = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`bg-light border-end ${isCollapsed ? 'w-10' : 'w-64'} transition-all duration-300 h-screen fixed top-0 left-0 overflow-y-auto`}>
      <div className="p-3">
        <button
          className="btn btn-outline-primary w-full mb-3"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? '☰' : '✕'}
        </button>
        <ul className="nav flex-column">
          
            <li className="nav-item relative group">
              <NavLink
                to="/Dashboard"
                className={({ isActive }) => `nav-link flex items-center gap-2 ${
                  isActive ? 'active text-primary fw-bold' : 'text-dark'
                }`}
              >
                <FaHome className="text-lg" />
                {!isCollapsed && <span>Dashboard</span>}
              </NavLink>
              {isCollapsed && (
                <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  Dashboard
                </span>
              )}
            </li>
         
          {role === 'admin' && (
            <li className="nav-item relative group">
              <NavLink
                to="/users"
                className={({ isActive }) => `nav-link flex items-center gap-2 ${
                  isActive ? 'active text-primary fw-bold' : 'text-dark'
                }`}
              >
                <FaUsers className="text-lg" />
                {!isCollapsed && <span>Users</span>}
              </NavLink>
              {isCollapsed && (
                <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  Users
                </span>
              )}
            </li>
          )}
            {role === 'admin' && (
            <li className="nav-item relative group">
              <NavLink
                to="/amounts"
                className={({ isActive }) => `nav-link flex items-center gap-2 ${
                  isActive ? 'active text-primary fw-bold' : 'text-dark'
                }`}
              >
                <FaUsers className="text-lg" />
                {!isCollapsed && <span>amounts</span>}
              </NavLink>
              {isCollapsed && (
                <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  amounts
                </span>
              )}
            </li>
          )}
          <li className="nav-item relative group">
            <NavLink
              to="/loans"
              className={({ isActive }) => `nav-link flex items-center gap-2 ${
                isActive ? 'active text-primary fw-bold' : 'text-dark'
              }`}
            >
              <FaMoneyBill className="text-lg" />
              {!isCollapsed && <span>Loans</span>}
            </NavLink>
            {isCollapsed && (
              <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                Loans
              </span>
            )}
          </li>
          <li className="nav-item relative group">
            <NavLink
              to="/payments"
              className={({ isActive }) => `nav-link flex items-center gap-2 ${
                isActive ? 'active text-primary fw-bold' : 'text-dark'
              }`}
            >
              <FaCreditCard className="text-lg" />
              {!isCollapsed && <span>Payments</span>}
            </NavLink>
            {isCollapsed && (
              <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                Payments
              </span>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;