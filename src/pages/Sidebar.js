import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUsers, FaMoneyBill, FaCreditCard } from 'react-icons/fa';

const Sidebar = ({ role }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <style>
        {`
          .sidebar-custom {
            height: 100vh !important; /* Explicitly enforce full height */
          }
          .sidebar-custom .sidebar-item {
            transition: all 0.3s ease;
          }
          .sidebar-custom .sidebar-item:hover {
            background-color: #f0f0f0;
          }
          .sidebar-custom .sidebar-item.active {
            background-color: #e9ecef;
            color: #000;
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
            background-color: #f0f0f0;
            color: #000;
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
        `}
      </style>
      <div className={`sidebar-custom ${isCollapsed ? 'sidebar-collapsed w-12' : 'w-64'} bg-light text-dark border-end transition-all duration-300 h-screen fixed top-0 left-0 overflow-y-auto`}>
        <div className="p-3">
          <button
            className="btn btn-outline-primary w-full mb-3"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? '☰' : '✕'}
          </button>
          <ul className="list-unstyled">
            <li className="sidebar-item relative mb-2">
              <NavLink
                to="/Dashboard"
                className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <FaHome className="text-lg" />
                {!isCollapsed && <span className="text-base">Dashboard</span>}
              </NavLink>
            </li>
            {role === 'admin' && (
              <li className="sidebar-item relative mb-2">
                <NavLink
                  to="/users"
                  className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <FaUsers className="text-lg" />
                  {!isCollapsed && <span className="text-base">Users</span>}
                </NavLink>
              </li>
            )}
            {role === 'admin' && (
              <li className="sidebar-item relative mb-2">
                <NavLink
                  to="/amounts"
                  className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <FaMoneyBill className="text-lg" />
                  {!isCollapsed && <span className="text-base">Amounts</span>}
                </NavLink>
              </li>
            )}
            <li className="sidebar-item relative mb-2">
              <NavLink
                to="/loans"
                className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <FaMoneyBill className="text-lg" />
                {!isCollapsed && <span className="text-base">Loans</span>}
              </NavLink>
            </li>
            <li className="sidebar-item relative mb-2">
              <NavLink
                to="/notice"
                className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <FaMoneyBill className="text-lg" />
                {!isCollapsed && <span className="text-base">Notice</span>}
              </NavLink>
            </li>
            <li className="sidebar-item relative mb-2">
              <NavLink
                to="/meeting"
                className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <FaMoneyBill className="text-lg" />
                {!isCollapsed && <span className="text-base">Meeting</span>}
              </NavLink>
            </li>
            <li className="sidebar-item relative mb-2">
              <NavLink
                to="/payments"
                className={({ isActive }) => `flex items-center gap-2 p-2 text-dark hover:text-dark w-full ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <FaCreditCard className="text-lg" />
                {!isCollapsed && <span className="text-base">Payments</span>}
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;