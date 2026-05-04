import React, { useState, useEffect } from 'react';
import { ChevronLeft, CreditCard, Calendar, CheckCircle2, Clock, Hotel, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentRecord {
  id: string;
  hotelName: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  method: string;
  nights: number;
}

const PaymentHistoryScreen: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load bookings from localStorage (simulating a database)
    const storedBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
    setPayments(storedBookings);
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this booking from your history?')) {
      const updatedPayments = payments.filter(p => p.id !== id);
      localStorage.setItem('hotelBookings', JSON.stringify(updatedPayments));
      setPayments(updatedPayments);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'Pending': return '#f59e0b';
      case 'Failed': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div className="fade-in" style={{ padding: '20px', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
          <ChevronLeft size={20} />
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Payment History</h1>
      </div>

      {/* Summary Card */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, #3498db 100%)', 
        color: 'white', 
        padding: '25px', 
        marginBottom: '25px',
        border: 'none'
      }}>
        <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>Total Spent (This Month)</div>
        <div style={{ fontSize: '32px', fontWeight: '900' }}>
          ₹{payments.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
        </div>
      </div>

      {/* List */}
      <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '15px', color: '#1e293b' }}>Recent Transactions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {payments.map((payment, index) => (
          <div 
            key={payment.id + index} 
            className="card" 
            style={{ 
              padding: '15px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px',
              border: '1px solid #f1f5f9'
            }}
          >
            <div style={{ 
              width: '45px', 
              height: '45px', 
              background: '#f8fafc', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <Hotel size={22} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b' }}>{payment.hotelName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontWeight: '800', color: '#1e293b' }}>₹{payment.amount}</div>
                  <button 
                    onClick={() => handleDelete(payment.id)}
                    style={{ background: 'none', border: 'none', padding: '5px', cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {payment.date}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CreditCard size={12} /> {payment.method}
                  </div>
                </div>
                
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: '700', 
                  color: getStatusColor(payment.status),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {payment.status === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {payment.status}
                </div>
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>ID: {payment.id}</div>
            </div>
          </div>
        ))}

        {payments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
            <CreditCard size={48} style={{ opacity: 0.1, marginBottom: '15px' }} />
            <p>No payment history found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryScreen;
