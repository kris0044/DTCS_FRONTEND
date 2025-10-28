import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Amount from './pages/Amount';
import Loans from './pages/Loans';
import InterestRate from './pages/InterestRate';
import LoanDetails from './pages/LoanDetails';
import Meetings from './pages/Meetings';
import Resignations from './pages/Resignations';
import Notices from './pages/Notices';
import BalanceManagement from './pages/BalanceManagement';
import MyProfile from './pages/MyProfile';
import EmiList from './pages/EmiList';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/amounts" element={<Amount />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/loans/:id" element={<LoanDetails />} />
        <Route path="/interest-rates" element={<InterestRate />} />
        <Route path='/meeting' element={<Meetings />} />
        <Route path='/notice' element={<Notices />} />
        <Route path="/balances" element={<BalanceManagement />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/resignations" element={<Resignations />} />
        <Route path="/emis" element={<EmiList />} />
        {/* Add other routes as needed */}
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;