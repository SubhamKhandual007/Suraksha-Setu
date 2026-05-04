import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ShieldCheck } from 'lucide-react';

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An error occurred");
      } else {
        setMessage("An unexpected error occurred.");
      }
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '12px', border: '1px solid #bae6fd', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <ShieldCheck size={20} color="#0ea5e9" />
        <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: '600' }}>Secure Stripe Payment Gateway</span>
      </div>
      
      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      
      {message && <div id="payment-message" style={{ color: 'var(--danger)', fontSize: '13px', textAlign: 'center', fontWeight: '600' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          className="btn btn-primary"
          style={{ flex: 2, padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '800' }}
        >
          <span id="button-text">
            {isLoading ? <div className="spinner" style={{ width: '20px', height: '20px' }}></div> : `Pay ₹${amount}`}
          </span>
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
