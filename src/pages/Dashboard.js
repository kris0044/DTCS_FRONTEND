import { useMemo } from 'react';
import useDashboard from '../hooks/dashboard';
import Header from './Header';
import Sidebar from './Sidebar';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

const Dashboard = () => {
  const {
    role,
    dashboardData,
   
    error,
  
    handleLogout,
  } = useDashboard();

  // Payment Bar Chart (Total Payments per Month)
  const paymentBarChartData = useMemo(() => {
    const sortedPayments = [...dashboardData.paymentSummary].sort((a, b) => a._id.localeCompare(b._id));
    return {
      type: 'bar',
      labels: sortedPayments.map((p) => p._id),
      datasets: [
        {
          label: 'Total Payments (₹)',
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
    const statuses = { pending: 0, approved: 0, rejected: 0 };
    dashboardData.loanSummary.forEach((s) => {
      statuses[s._id] = s.count;
    });
    return {
      type: 'pie',
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [
        {
          data: [statuses.pending, statuses.approved, statuses.rejected],
          backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384'],
          hoverOffset: 4,
        },
      ],
    };
  }, [dashboardData.loanSummary]);

  // Loan Amounts Bar Chart
  const loanBarChartData = useMemo(() => {
    const amounts = { pending: 0, approved: 0, rejected: 0 };
    dashboardData.loanSummary.forEach((s) => {
      amounts[s._id] = s.totalAmount;
    });
    return {
      type: 'bar',
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [
        {
          label: 'Loan Amounts (₹)',
          data: [amounts.pending, amounts.approved, amounts.rejected],
          backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384'],
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

  return (
    <div className="d-flex">
      <Sidebar role={role} />
      <div className="flex-grow-1">
        <Header role={role} onLogout={handleLogout} />
        <div className="container mt-4">
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Current Amount
          {dashboardData.currentAmount && (
            <div className="card mb-4 shadow">
              <div className="card-body">
                <h3 className="card-title">Current Monthly Payment</h3>
                <p>Amount: ₹{dashboardData.currentAmount.amount}</p>
                <p>Effective Date: {new Date(dashboardData.currentAmount.effectiveDate).toLocaleDateString()}</p>
              </div>
            </div>
          )} */}

          {/* Notices */}
          {/* <div className="card mb-4 shadow">
            <div className="card-body">
              <h3 className="card-title">Recent Notices</h3>
              {dashboardData.notices.length === 0 ? (
                <p>No notices available</p>
              ) : (
                <ul className="list-group">
                  {dashboardData.notices.map((notice) => (
                    <li key={notice._id} className="list-group-item">
                      <strong>{notice.title}</strong>: {notice.description} <br />
                      <small>{new Date(notice.date).toLocaleDateString()}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div> */}

          {/* Meetings */}
          {/* <div className="card mb-4 shadow">
            <div className="card-body">
              <h3 className="card-title">Upcoming Meetings</h3>
              {dashboardData.meetings.length === 0 ? (
                <p>No upcoming meetings</p>
              ) : (
                <ul className="list-group">
                  {dashboardData.meetings.map((meeting) => (
                    <li key={meeting._id} className="list-group-item">
                      <strong>{meeting.title}</strong>: {meeting.description} <br />
                      <small>
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                      </small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div> */}

          {role === 'staff' && (
            <>
              {/* Make Payment */}
              {/* <div className="card mb-4 shadow">
                <div className="card-body">
                  <h3 className="card-title">Make Monthly Payment</h3>
                  <form onSubmit={handleMakePayment}>
                    <div className="mb-3">
                      <label htmlFor="paymentMonth" className="form-label">
                        Month (e.g., 2025-08)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="paymentMonth"
                        name="paymentMonth"
                        value={formData.paymentMonth}
                        onChange={(e) => setFormData({ ...formData, paymentMonth: e.target.value })}
                        placeholder="Enter month"
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={!dashboardData.currentAmount}
                    >
                      Pay ₹{dashboardData.currentAmount ? dashboardData.currentAmount.amount : 'Loading...'}
                    </button>
                  </form>
                </div>
              </div> */}

              {/* Request Loan */}
              {/* <div className="card mb-4 shadow">
                <div className="card-body">
                  <h3 className="card-title">Request Loan</h3>
                  <form onSubmit={handleRequestLoan}>
                    <div className="mb-3">
                      <label htmlFor="loanAmount" className="form-label">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="loanAmount"
                        name="loanAmount"
                        value={formData.loanAmount}
                        onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="loanReason" className="form-label">
                        Reason
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="loanReason"
                        name="loanReason"
                        value={formData.loanReason}
                        onChange={(e) => setFormData({ ...formData, loanReason: e.target.value })}
                        placeholder="Enter reason"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Request Loan
                    </button>
                  </form>
                </div>
              </div> */}
            </>
          )}

          {role === 'admin' && (
            <>
              {/* Pending User Approvals */}
              {/* <div className="card mb-4 shadow">
                <div className="card-body">
                  <h3 className="card-title">Pending User Approvals</h3>
                  {dashboardData.pendingUsers.length === 0 ? (
                    <p>No pending approvals</p>
                  ) : (
                    <ul className="list-group">
                      {dashboardData.pendingUsers.map((user) => (
                        <li
                          key={user._id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          {user.name} ({user.email})
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleApproveUser(user._id)}
                          >
                            Approve
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div> */}

              {/* Pending Loan Requests */}
              {/* <div className="card mb-4 shadow">
                <div className="card-body">
                  <h3 className="card-title">Pending Loan Requests</h3>
                  {dashboardData.userLoans.filter((l) => l.status === 'pending').length === 0 ? (
                    <p>No pending loans</p>
                  ) : (
                    <ul className="list-group">
                      {dashboardData.userLoans
                        .filter((l) => l.status === 'pending')
                        .map((loan) => (
                          <li
                            key={loan._id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            {loan.user.name}: ₹{loan.amount} - {loan.reason}
                            <div>
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => handleUpdateLoan(loan._id, 'approved')}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleUpdateLoan(loan._id, 'rejected')}
                              >
                                Reject
                              </button>
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div> */}
            </>
          )}

          {/* Charts */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-body">
                  <h3 className="card-title">Payments by Month</h3>
                  {dashboardData.paymentSummary.length === 0 ? (
                    <p>No payment data available</p>
                  ) : (
                    <Bar
                      data={paymentBarChartData}
                      options={{
                        responsive: true,
                        plugins: { legend: { position: 'top' }, title: { display: true, text: 'Payments by Month' } },
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card shadow">
                <div className="card-body">
                  <h3 className="card-title">Cumulative Payments</h3>
                  {dashboardData.paymentSummary.length === 0 ? (
                    <p>No payment data available</p>
                  ) : (
                    <Line
                      data={paymentLineChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' },
                          title: { display: true, text: 'Cumulative Payments Over Time' },
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
    <div className="card shadow">
      <div className="card-body">
        <h3 className="card-title">Loan Status Distribution</h3>
        {dashboardData.loanSummary.length === 0 ? (
          <p>No loan data available</p>
        ) : (
          <div className="chart-container">
            <Pie
              data={loanPieChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false, // Allow chart to fill container
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Loan Status Distribution' },
                },
              }}
              height={300} // Set explicit height
            />
          </div>
        )}
      </div>
    </div>
  </div>
  <div className="col-md-6">
    <div className="card shadow">
      <div className="card-body">
        <h3 className="card-title">Loan Amounts by Status</h3>
        {dashboardData.loanSummary.length === 0 ? (
          <p>No loan data available</p>
        ) : (
          <div className="chart-container">
            <Bar
              data={loanBarChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false, // Allow chart to fill container
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Loan Amounts by Status' },
                },
              }}
              height={300} // Set explicit height
            />
          </div>
        )}
      </div>
    </div>
  </div>
</div>

          {/* Payment History (User-specific for staff, all for admin) */}
          <div className="card mb-4 shadow">
            <div className="card-body">
              <h3 className="card-title">Payment History</h3>
              {dashboardData.userPayments.length === 0 ? (
                <p>No payments recorded</p>
              ) : (
                <ul className="list-group">
                  {dashboardData.userPayments.map((p) => (
                    <li key={p._id} className="list-group-item">
                      ₹{p.amount} for {p.month} on {new Date(p.date).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Loan History (User-specific for staff, all for admin) */}
          <div className="card shadow">
            <div className="card-body">
              <h3 className="card-title">Loan History</h3>
              {dashboardData.userLoans.length === 0 ? (
                <p>No loans recorded</p>
              ) : (
                <ul className="list-group">
                  {dashboardData.userLoans.map((l) => (
                    <li key={l._id} className="list-group-item">
                      ₹{l.amount} - {l.reason} ({l.status}) on {new Date(l.date).toLocaleDateString()}
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