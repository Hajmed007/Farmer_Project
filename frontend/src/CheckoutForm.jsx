import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Alert } from 'react-bootstrap';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { useTranslation } from 'react-i18next';

const CheckoutForm = ({ deliveryType, items }) => {
    const { t } = useTranslation();
    const stripe = useStripe();
    const elements = useElements();
    const { clearSpecifiedItems } = useCart();
    const navigate = useNavigate();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required', // Changed to handle order placement logic manually
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
            } else {
                setMessage(t('error_occurred'));
            }
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Payment succeeded, now place the order in the database
            try {
                const orderItems = items.map(item => ({
                    productId: item.id,
                    quantity: item.cartQuantity // Use cartQuantity from context
                }));

                await api.post('/orders', {
                    items: orderItems,
                    deliveryType,
                    paymentMethod: 'STRIPE'
                });
                clearSpecifiedItems(items.map(i => i.id));
                alert(t('order_success'));
                navigate('/my-orders');
            } catch (err) {
                console.error("Payment succeeded but order placement failed", err);
                setMessage(t('payment_success_order_fail'));
                setIsLoading(false);
            }
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" className="mb-4" />

            {message && <Alert variant="danger">{message}</Alert>}

            <Button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                variant="success"
                size="lg"
                className="w-100 py-3 fw-bold"
                type="submit"
            >
                {isLoading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {t('processing')}
                    </>
                ) : (
                    t('pay_now')
                )}
            </Button>
        </form>
    );
};

export default CheckoutForm;
