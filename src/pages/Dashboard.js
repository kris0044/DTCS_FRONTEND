import { useMemo } from 'react';
import useDashboard from '../hooks/dashboard';
import Header from './Header';
import Sidebar from './Sidebar';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

const Dashboard = () => {
  const {
    role,
    dashboardData,
    error,
    handleLogout,
  } = useDashboard();
  const navigate = useNavigate();

  // Payment Bar Chart (Total Payments per Month)
  const paymentBarChartData = useMemo(() => {
    const sortedPayments = [...dashboardData.paymentSummary].sort((a, b) => a._id.localeCompare(b._id));
    return {
      type: 'bar',
      labels: sortedPayments.map((p) => p._id),
      datasets: [
        {
          label: 'Total Maintainance paid (₹)',
          data: sortedPayments.map((p) => p.totalAmount),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [dashboardData.paymentSummary]);

  // Loan Pie Chart (Status Distribution)
  const loanPieChartData = useMemo(() => {
    const statuses = { pending: 0, approved: 0, rejected: 0, completed: 0 };
    dashboardData.loanSummary.forEach((s) => {
      statuses[s._id] = s.count;
    });
    return {
      type: 'pie',
      labels: ['Pending', 'Approved', 'Rejected', 'Completed'],
      datasets: [
        {
          data: [statuses.pending, statuses.approved, statuses.rejected, statuses.completed],
          backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384', '#4BC0C0'],
          hoverOffset: 4,
        },
      ],
    };
  }, [dashboardData.loanSummary]);

  // Loan Amounts Bar Chart
  const loanBarChartData = useMemo(() => {
    const amounts = { pending: 0, approved: 0, rejected: 0, completed: 0 };
    dashboardData.loanSummary.forEach((s) => {
      amounts[s._id] = s.totalAmount;
    });
    return {
      type: 'bar',
      labels: ['Pending', 'Approved', 'Rejected', 'Completed'],
      datasets: [
        {
          label: 'Loan Amounts (₹)',
          data: [amounts.pending, amounts.approved, amounts.rejected, amounts.completed],
          backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384', '#4BC0C0'],
        },
      ],
    };
  }, [dashboardData.loanSummary]);

  // Cumulative Payments Line Chart
  const paymentLineChartData = useMemo(() => {
    const sortedPayments = [...dashboardData.paymentSummary].sort((a, b) => a._id.localeCompare(b._id));
    let cumulative = 0;
    const cumulativeData = sortedPayments.map((p) => {
      cumulative += p.totalAmount;
      return cumulative;
    });
    return {
      type: 'line',
      labels: sortedPayments.map((p) => p._id),
      datasets: [
        {
          label: 'Cumulative Payments (₹)',
          data: cumulativeData,
          fill: false,
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
        },
      ],
    };
  }, [dashboardData.paymentSummary]);

  // Define count cards based on role
  const countCards = role === 'staff' ? [
    { title: 'Completed Loans', value: dashboardData.counts.completedLoans, route: '/loans?status=completed' },
    { title: 'Pending Loans', value: dashboardData.counts.pendingLoans, route: '/loans?status=pending' },
    { title: 'Ongoing Loans', value: dashboardData.counts.ongoingLoans, route: '/loans?status=approved' },
    { title: 'Rejected Loans', value: dashboardData.counts.rejectedLoans, route: '/loans?status=rejected' },
    { title: 'Total Resignations', value: dashboardData.counts.totalResignations, route: '/resignations' },
    { title: 'Total Contribution', value: `₹${dashboardData.counts.totalPayments.toFixed(2)}`, route: '/payments' },
  ] : [
    { title: 'Completed Loans', value: dashboardData.counts.completedLoans, route: '/loans?status=completed' },
    { title: 'Pending Loans', value: dashboardData.counts.pendingLoans, route: '/loans?status=pending' },
    { title: 'Ongoing Loans', value: dashboardData.counts.ongoingLoans, route: '/loans?status=approved' },
    { title: 'Rejected Loans', value: dashboardData.counts.rejectedLoans, route: '/loans?status=rejected' },
    { title: 'Total Users', value: dashboardData.counts.totalUsers, route: '/users' },
    { title: 'Total Meetings', value: dashboardData.counts.totalMeetings, route: '/meetings' },
    { title: 'Total Notices', value: dashboardData.counts.totalNotices, route: '/notices' },
    { title: 'Total Balance', value: `₹${dashboardData.counts.totalBalance.toFixed(2)}`, route: '/balances' },
    { title: 'Total Resignations', value: dashboardData.counts.totalResignations, route: '/resignations' },
    { title: 'Total Contribution', value: `₹${dashboardData.counts.totalPayments.toFixed(2)}`, route: '/payments' },
  ];

  return (
    <div className="min-vh-100 d-flex" style={{ backgroundColor: '#ffffff' }}>
      <Sidebar role={role} />
      <div className="flex-grow-1">
        <Header role={role} onLogout={handleLogout} />
        <div className="container mt-4 p-4">
          {error && (
            <div
              className="alert text-center"
              style={{ border: '2px solid #dc3545', backgroundColor: '#ffffff', color: '#dc3545' }}
            >
              {error}
            </div>
          )}

          {/* Count Cards */}
          <div className="row">
            {countCards.map((card, index) => (
              <div key={index} className="col-md-4 mb-4">
                <div
                  className="card shadow-lg"
                  style={{ cursor: 'pointer', borderRadius: '20px', backgroundColor: '#f8f9fa' }}
                  onClick={() => navigate(card.route)}
                >
                  <div className="card-body text-center" style={{ color: '#333333' }}>
                    <h5 className="card-title">{card.title}</h5>
                    <p className="card-text" style={{ fontSize: '2rem' }}>
                      {card.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card shadow-lg" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
                <div className="card-body">
                  <h3 className="card-title text-center" style={{ color: '#333333' }}>
                    Payments by Month
                  </h3>
                  {dashboardData.paymentSummary.length === 0 ? (
                    <p className="text-center" style={{ color: '#333333' }}>
                      No payment data available
                    </p>
                  ) : (
                    <Bar
                      data={paymentBarChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top', labels: { color: '#333333' } },
                          title: { display: true, text: 'Payments by Month', color: '#333333' },
                        },
                        scales: {
                          x: { ticks: { color: '#333333' } },
                          y: { ticks: { color: '#333333' } },
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-lg" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
                <div className="card-body">
                  <h3 className="card-title text-center" style={{ color: '#333333' }}>
                    Cumulative Payments
                  </h3>
                  {dashboardData.paymentSummary.length === 0 ? (
                    <p className="text-center" style={{ color: '#333333' }}>
                      No payment data available
                    </p>
                  ) : (
                    <Line
                      data={paymentLineChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top', labels: { color: '#333333' } },
                          title: { display: true, text: 'Cumulative Payments Over Time', color: '#333333' },
                        },
                        scales: {
                          x: { ticks: { color: '#333333' } },
                          y: { ticks: { color: '#333333' } },
                        },
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card shadow-lg" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
                <div className="card-body">
                  <h3 className="card-title text-center" style={{ color: '#333333' }}>
                    Loan Status Distribution
                  </h3>
                  {dashboardData.loanSummary.length === 0 ? (
                    <p className="text-center" style={{ color: '#333333' }}>
                      No loan data available
                    </p>
                  ) : (
                    <div className="chart-container">
                      <Pie
                        data={loanPieChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'top', labels: { color: '#333333' } },
                            title: { display: true, text: 'Loan Status Distribution', color: '#333333' },
                          },
                        }}
                        height={300}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow-lg" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
                <div className="card-body">
                  <h3 className="card-title text-center" style={{ color: '#333333' }}>
                    Loan Amounts by Status
                  </h3>
                  {dashboardData.loanSummary.length === 0 ? (
                    <p className="text-center" style={{ color: '#333333' }}>
                      No loan data available
                    </p>
                  ) : (
                    <div className="chart-container">
                      <Bar
                        data={loanBarChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'top', labels: { color: '#333333' } },
                            title: { display: true, text: 'Loan Amounts by Status', color: '#333333' },
                          },
                          scales: {
                            x: { ticks: { color: '#333333' } },
                            y: { ticks: { color: '#333333' } },
                          },
                        }}
                        height={300}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="card shadow-lg mb-4" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
            <div className="card-body">
              <h3 className="card-title text-center" style={{ color: '#333333' }}>
                Payment History
              </h3>
              {dashboardData.userPayments.length === 0 ? (
                <p className="text-center" style={{ color: '#333333' }}>
                  No payments recorded
                </p>
              ) : (
                <ul className="list-group">
                  {dashboardData.userPayments.map((p) => (
                    <li
                      key={p._id}
                      className="list-group-item"
                      style={{ backgroundColor: '#f1f3f5', color: '#333333' }}
                    >
                      ₹{p.amount.toFixed(2)} for {p.month} on {new Date(p.date).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Loan History */}
          <div className="card shadow-lg" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
            <div className="card-body">
              <h3 className="card-title text-center" style={{ color: '#333333' }}>
                Loan History
              </h3>
              {dashboardData.userLoans.length === 0 ? (
                <p className="text-center" style={{ color: '#333333' }}>
                  No loans recorded
                </p>
              ) : (
                <ul className="list-group">
                  {dashboardData.userLoans.map((l) => (
                    <li
                      key={l._id}
                      className="list-group-item"
                      style={{ backgroundColor: '#f1f3f5', color: '#333333' }}
                    >
                      ₹{l.amount.toFixed(2)} - {l.reason} ({l.status}) on {new Date(l.date).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;