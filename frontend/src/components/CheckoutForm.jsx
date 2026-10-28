import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CheckoutForm = ({ amount, onSuccess, donorName }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);

        try {
            // 1. Ask backend to create a payment intent and return clientSecret
            const response = await fetch(`${API_URL}/api/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount, name: donorName }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initialize payment');
            }

            // 2. Confirm the payment on the frontend using the clientSecret
            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: donorName || 'Anonymous Donor',
                    },
                },
            });

            if (result.error) {
                setError(result.error.message);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    onSuccess(amount);
                    setError(null);
                }
            }
        } catch (err) {
            setError(err.message);
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                            color: '#3f3f46',
                            '::placeholder': {
                                color: '#a1a1aa',
                            },
                        },
                        invalid: {
                            color: '#dc2626',
                        },
                    },
                }} />
            </div>
            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 tracking-wide shadow-md"
            >
                {loading ? 'Processing...' : `Donate Rs. ${amount.toLocaleString()}`}
            </button>
        </form>
    );
};

export default CheckoutForm;
