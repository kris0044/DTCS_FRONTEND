import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getLoanDetails, updatePaymentStatus } from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Header from './Header';
import Sidebar from './Sidebar';

const LoanDetails = () => {
  const { id } = useParams();
  const [role, setRole] = useState('');
  const [loan, setLoan] = useState(null);
  const [paidEMIs, setPaidEMIs] = useState(0);
  const [pendingEMIs, setPendingEMIs] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const user = jwtDecode(token).user;
      console.log('Decoded user:', user);
      setRole(user.role);
      fetchLoanDetails();
    } catch (err) {
      console.error('Token Decode Error:', err.stack);
      setError('Invalid token, please log in again');
      navigate('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const fetchLoanDetails = async () => {
    setLoading(true);
    try {
      const res = await getLoanDetails(id);
      console.log('Fetched loan details:', res.data);
      setLoan(res.data.loan);
      setPaidEMIs(res.data.paidEMIs);
      setPendingEMIs(res.data.pendingEMIs);
      console.log('Set loan state:', res.data.loan);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch loan details');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (paymentIndex, newStatus) => {
    try {
      setLoading(true);
      await updatePaymentStatus(id, paymentIndex, newStatus);
      await fetchLoanDetails();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update payment status');
      console.error('Update status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (payment, index) => {
    if (!loan || !loan.user || !loan.user.name) {
      console.error('Loan, loan.user, or loan.user.name is undefined, refreshing data:', { loan });
      await fetchLoanDetails();
      if (!loan || !loan.user || !loan.user.name) {
        console.error('Failed to refresh loan data:', { loan });
        setError('Loan data unavailable, please try again');
        return;
      }
    }

    console.log('Generating PDF with loan data:', {
      loanId: loan._id,
      user: loan.user,
      userName: loan.user.name,
      role,
      payment,
      index,
    });

    const doc = new jsPDF();

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Payment Receipt', 105, 20, { align: 'center' });

    // Subheader
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Loan Management System', 105, 30, { align: 'center' });

    // Table with Payment Details
    const userName = loan.user.name || 'Unknown User';
    console.log('User name for PDF:', userName);

    autoTable(doc, {
      startY: 40,
      head: [['Field', 'Details']],
      body: [
        ['Loan ID', loan._id || 'N/A'],
        ['User', userName],
        ['Payment #', index + 1],
        ['Amount', `₹${payment.amount.toFixed(2)}`],
        ['Due Date', new Date(payment.date).toLocaleDateString()],
        ['Status', payment.status.charAt(0).toUpperCase() + payment.status.slice(1)],
      ],
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10,
        textColor: [40, 40, 40],
        lineColor: [200, 200, 200],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [60, 141, 188],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 110 },
      },
      margin: { left: 20, right: 20 },
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, pageHeight - 20);
    doc.text('Loan Management System', 105, pageHeight - 20, { align: 'center' });
    doc.text('Page 1 of 1', 190, pageHeight - 20, { align: 'right' });

    // Save the PDF
    doc.save(`payment_receipt_loan_${loan._id}_payment_${index + 1}.pdf`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      case 'completed':
        return 'bg-primary';
      case 'pending':
      default:
        return 'bg-warning';
    }
  };

  return (
    <div className="d-flex">
      <Sidebar role={role} />
      <div className="flex-grow-1">
        <Header role={role} onLogout={handleLogout} />
        <div className="container mt-4">
          <h2 className="mb-4">Loan Details</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {loading && <div className="alert alert-info">Loading...</div>}
          {loan && (
            <div className="card shadow">
              <div className="card-body">
                <h3 className="card-title">Loan ID: {loan._id}</h3>
                <p><strong>User:</strong> {loan.user?.name || 'Unknown'}</p>
                <p><strong>Amount:</strong> ₹{loan.amount}</p>
                <p><strong>Reason:</strong> {loan.reason}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${getStatusBadgeClass(loan.status)} text-white`}>
                    {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                  </span>
                </p>
                <p><strong>Interest Rate:</strong> {loan.interestRate ? `${loan.interestRate}%` : 'N/A'}</p>
                <p><strong>Duration:</strong> {loan.duration ? `${loan.duration} months` : 'N/A'}</p>
                <p><strong>Total Payable:</strong> ₹{loan.totalAmountPayable ? loan.totalAmountPayable.toFixed(2) : 'N/A'}</p>
                <p><strong>Monthly EMI:</strong> ₹{loan.emiAmount ? loan.emiAmount.toFixed(2) : 'N/A'}</p>
                <p><strong>Amount Paid:</strong> ₹{paidEMIs.toFixed(2)}</p>
                <p><strong>Pending EMIs:</strong> {pendingEMIs}</p>
                <h4 className="mt-4">Payment Schedule</h4>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Payment #</th>
                      <th>Amount (₹)</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loan.payments.map((payment, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{payment.amount.toFixed(2)}</td>
                        <td>{new Date(payment.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge bg-${payment.status === 'paid' ? 'success' : 'warning'} text-white`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {role === 'admin' ? (
                            <select
                              value={payment.status}
                              onChange={(e) => handleUpdateStatus(index, e.target.value)}
                              className="form-select form-select-sm"
                              disabled={loading || loan.status === 'completed'}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                            </select>
                          ) : (
                            payment.status === 'paid' && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleDownloadPDF(payment, index)}
                                disabled={loading || !loan}
                              >
                                Download PDF
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;