import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUsers, FaBalanceScale, FaMoneyCheckAlt, FaHandHoldingUsd, FaSignOutAlt, FaBell, FaCalendarAlt, FaCreditCard } from 'react-icons/fa';

const Sidebar = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <style>
        {`
          .sidebar-custom {
            height: 100vh !important; /* Explicitly enforce full height */
            position: sticky;
            top: 0;
            z-index: 1000;
            background-color: #f8f9fa !important; /* Light gray to match Dashboard */
          }
          .sidebar-custom .sidebar-item {
            transition: all 0.3s ease;
          }
          .sidebar-custom .sidebar-item:hover {
            background-color: #e9ecef;
          }
          .sidebar-custom .sidebar-item.active {
            background-color: #dee2e6;
            color: #333333;
          }
          .sidebar-custom .sidebar-collapsed .sidebar-item {
            padding: 8px 0;
            min-width: 40px;
            justify-content: center;
          }
          .sidebar-custom .sidebar-collapsed .sidebar-item span {
            display: none;
          }
          .sidebar-custom .sidebar-collapsed .sidebar-item:hover::after {
            content: attr(data-tooltip);
            position: absolute;
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            background-color: #333333;
            color: #ffffff;
            padding: 4px 8px;
            border-radius: 4px;
            white-space: nowrap;
            margin-left: 8px;
            opacity: 0;
            transition: opacity 0.2s;
          }
          .sidebar-custom .sidebar-collapsed .sidebar-item:hover::after {
            opacity: 1;
          }
          .sidebar-custom .btn-outline-primary {
            border-color: #007bff;
            color: #007bff;
          }
          .sidebar-custom .btn-outline-primary:hover {
            background-color: #007bff;
            color: #ffffff;
          }
        `}
      </style>
      <div className={`sidebar-custom ${isCollapsed ? 'sidebar-collapsed w-12' : 'w-64'} border-end transition-all duration-300 h-screen fixed top-0 left-0 overflow-y-auto`}>
        <div className="p-3">
          <button
            className="btn btn-outline-primary w-full mb-3"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? '☰' : '✕'}
          </button>
          <ul className="list-unstyled">
            <li className="sidebar-item relative mb-2" data-tooltip="Dashboard">
              <NavLink
                to="/Dashboard"
                className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', color: '#333333' }}
              >
                <FaHome className="text-lg" />
                {!isCollapsed && <span className="text-base">Dashboard</span>}
              </NavLink>
            </li>
            {role === 'admin' && (
              <li className="sidebar-item relative mb-2" data-tooltip="Users">
                <NavLink
                  to="/users"
                  className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                  style={{ textDecoration: 'none', color: '#333333' }}
                >
                  <FaUsers className="text-lg" />
                  {!isCollapsed && <span className="text-base">Users</span>}
                </NavLink>
              </li>
            )}
            {role === 'admin' && (
              <li className="sidebar-item relative mb-2" data-tooltip="Balance">
                <NavLink
                  to="/balances"
                  className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                  style={{ textDecoration: 'none', color: '#333333' }}
                >
                  <FaBalanceScale className="text-lg" />
                  {!isCollapsed && <span className="text-base">Balance</span>}
                </NavLink>
              </li>
            )}
            {role === 'admin' && (
              <li className="sidebar-item relative mb-2" data-tooltip="Amount for Maintenance">
                <NavLink
                  to="/amounts"
                  className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                  style={{ textDecoration: 'none', color: '#333333' }}
                >
                  <FaMoneyCheckAlt className="text-lg" />
                  {!isCollapsed && <span className="text-base">Amount </span>}
                </NavLink>
              </li>
            )}
            <li className="sidebar-item relative mb-2" data-tooltip="Loans">
              <NavLink
                to="/loans"
                className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', color: '#333333' }}
              >
                <FaHandHoldingUsd className="text-lg" />
                {!isCollapsed && <span className="text-base">Loans</span>}
              </NavLink>
            </li>
                        <li className="sidebar-item relative mb-2" data-tooltip="Loans">
              <NavLink
                to="/emis"
                className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', color: '#333333' }}
              >
                <FaHandHoldingUsd className="text-lg" />
                {!isCollapsed && <span className="text-base">EmiList</span>}
              </NavLink>
            </li>
            <li className="sidebar-item relative mb-2" data-tooltip="Resignations">
              <NavLink
                to="/resignations"
                className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', color: '#333333' }}
              >
                <FaSignOutAlt className="text-lg" />
                {!isCollapsed && <span className="text-base">Resignations</span>}
              </NavLink>
            </li>
            <li className="sidebar-item relative mb-2" data-tooltip="Notice">
              <NavLink
                to="/notice"
                className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', color: '#333333' }}
              >
                <FaBell className="text-lg" />
                {!isCollapsed && <span className="text-base">Notice</span>}
              </NavLink>
            </li>
            <li className="sidebar-item relative mb-2" data-tooltip="Meeting">
              <NavLink
                to="/meeting"
                className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', color: '#333333' }}
              >
                <FaCalendarAlt className="text-lg" />
                {!isCollapsed && <span className="text-base">Meeting</span>}
              </NavLink>
            </li>
            <li className="sidebar-item relative mb-2" data-tooltip="Maintenance Paid">
              <NavLink
                to="/payments"
                className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none', color: '#333333' }}
              >
                <FaCreditCard className="text-lg" />
                {!isCollapsed && <span className="text-base">Contribution</span>}
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;