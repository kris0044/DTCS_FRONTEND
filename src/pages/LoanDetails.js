import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getLoanDetails, updatePaymentStatus } from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Header from './Header';
import Sidebar from './Sidebar';
import swal from 'sweetalert';

const LoanDetails = () => {
  const { id } = useParams();
  const [role, setRole] = useState('');
  const [loan, setLoan] = useState(null);
  const [paidEMIs, setPaidEMIs] = useState(0);
  const [pendingEMIs, setPendingEMIs] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const user = jwtDecode(token).user;
      console.log('Decoded user:', { id: user.id, role: user.role });
      setRole(user.role);
      fetchLoanDetails();
    } catch (err) {
      console.error('Token Decode Error:', err.stack);
      setError('Invalid token, please log in again');
      navigate('/login');
    }
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
      console.error('Fetch error:', err.response?.data);
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
      console.error('Update status error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (payment, index) => {
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        setError('Razorpay script failed to load');
        swal('Error!', 'Razorpay script failed to load.', 'error');
        return;
      }

      const amountToPay = Number(payment.amount).toFixed(2);
      const userId = jwtDecode(localStorage.getItem('token')).user.id;
      console.log('EMI Payment Attempt:', { amountToPay, index, userId, loanId: id });

      swal({
        title: 'Confirm Payment',
        text: `Are you sure you want to pay ₹${amountToPay} for EMI #${index + 1}? This is not refundable.`,
        icon: 'warning',
        buttons: true,
        dangerMode: true,
      }).then(async (willPay) => {
        if (willPay) {
          const options = {
            key: 'rzp_test_zt5DDs1PmkkyDy', // Replace with your Razorpay key
            amount: Number(amountToPay) * 100,
            currency: 'INR',
            name: 'Society Management System',
            handler: async (response) => {
              console.log('Razorpay Response:', response);
              setLoading(true);
              try {
                await updatePaymentStatus(id, index, 'paid');
                await fetchLoanDetails();
                swal('Payment successful!', 'Your EMI payment has been processed successfully.', 'success');
              } catch (err) {
                const errorMsg = err.response?.data?.msg || 'Failed to update payment status';
                setError(errorMsg);
                console.error('Payment Status API Error:', err.response?.data);
                swal('Payment failed!', errorMsg, 'error');
              } finally {
                setLoading(false);
              }
            },
            prefill: {
              name: jwtDecode(localStorage.getItem('token')).user.name,
              email: jwtDecode(localStorage.getItem('token')).user.email,
              contact: '',
            },
            theme: {
              color: '#007bff',
            },
          };

          const paymentObject = new window.Razorpay(options);
          paymentObject.open();
        }
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Failed to initiate payment');
      swal('Payment failed!', 'There was an error initiating your payment.', 'error');
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

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Payment Receipt', 105, 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Society Management System', 105, 30, { align: 'center' });

    const userName = loan.user.name || 'Unknown User';
    console.log('User name for PDF:', userName);

    autoTable(doc, {
      startY: 40,
      head: [['Field', 'Details']],
      body: [
        ['Loan ID', loan._id || 'N/A'],
        ['User', userName],
        ['Payment #', index + 1],
        ['Amount', `₹${Number(payment.amount).toFixed(2)}`],
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

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, pageHeight - 20);
    doc.text('Society Management System', 105, pageHeight - 20, { align: 'center' });
    doc.text('Page 1 of 1', 190, pageHeight - 20, { align: 'right' });

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
    <div className="min-vh-100 d-flex" style={{ backgroundColor: '#ffffff' }}>
      <Sidebar role={role} />
      <div className="flex-grow-1">
        <Header role={role} onLogout={handleLogout} />
        <div className="container mt-4 p-4">
          <h2 className="mb-4" style={{ color: '#333333' }}>Loan Details</h2>
          {error && (
            <div
              className="alert text-center"
              style={{ border: '2px solid #dc3545', backgroundColor: '#ffffff', color: '#dc3545' }}
            >
              {error}
            </div>
          )}
          {loading && (
            <div className="alert alert-info" style={{ backgroundColor: '#e9ecef', color: '#333333' }}>
              Loading...
            </div>
          )}
          {loan && (
            <div className="card shadow-lg" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
              <div className="card-body">
                <h3 className="card-title" style={{ color: '#333333' }}>Loan ID: {loan._id}</h3>
                <p style={{ color: '#333333' }}><strong>User:</strong> {loan.user?.name || 'Unknown'}</p>
                <p style={{ color: '#333333' }}><strong>Amount:</strong> ₹{Number(loan.amount).toFixed(2)}</p>
                <p style={{ color: '#333333' }}><strong>Reason:</strong> {loan.reason}</p>
                <p style={{ color: '#333333' }}>
                  <strong>Status:</strong>{' '}
                  <span className={`badge ${getStatusBadgeClass(loan.status)} text-white`}>
                    {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                  </span>
                </p>
                <p style={{ color: '#333333' }}>
                  <strong>Interest Rate:</strong> {loan.interestRate ? `${loan.interestRate}%` : 'N/A'}
                </p>
                <p style={{ color: '#333333' }}>
                  <strong>Duration:</strong> {loan.duration ? `${loan.duration} months` : 'N/A'}
                </p>
                <p style={{ color: '#333333' }}>
                  <strong>Total Payable:</strong> ₹{loan.totalAmountPayable ? Number(loan.totalAmountPayable).toFixed(2) : 'N/A'}
                </p>
                <p style={{ color: '#333333' }}>
                  <strong>Monthly EMI:</strong> ₹{loan.emiAmount ? Number(loan.emiAmount).toFixed(2) : 'N/A'}
                </p>
                <p style={{ color: '#333333' }}><strong>Amount Paid:</strong> ₹{Number(paidEMIs).toFixed(2)}</p>
                <p style={{ color: '#333333' }}><strong>Pending EMIs:</strong> {pendingEMIs}</p>
                <h4 className="mt-4" style={{ color: '#333333' }}>Payment Schedule</h4>
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th style={{ color: '#333333' }}>Payment #</th>
                      <th style={{ color: '#333333' }}>Amount (₹)</th>
                      <th style={{ color: '#333333' }}>Due Date</th>
                      <th style={{ color: '#333333' }}>Status</th>
                      <th style={{ color: '#333333' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loan.payments.map((payment, index) => (
                      <tr key={index}>
                        <td style={{ color: '#333333' }}>{index + 1}</td>
                        <td style={{ color: '#333333' }}>{Number(payment.amount).toFixed(2)}</td>
                        <td style={{ color: '#333333' }}>{new Date(payment.date).toLocaleDateString()}</td>
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
                              style={{ color: '#333333', backgroundColor: '#e9ecef' }}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                            </select>
                          ) : (
                            <>
                              {payment.status === 'pending' && (
                                <button
                                  className="btn btn-sm btn-primary me-1"
                                  onClick={() => handlePayNow(payment, index)}
                                  disabled={loading || loan.status === 'completed'}
                                  style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
                                >
                                  Pay Now ₹{Number(payment.amount).toFixed(2)}
                                </button>
                              )}
                              {payment.status === 'paid' && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleDownloadPDF(payment, index)}
                                  disabled={loading || !loan}
                                  style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
                                >
                                  Download PDF
                                </button>
                              )}
                            </>
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