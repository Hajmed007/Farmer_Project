import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from './CartContext';
import { Container, Row, Col, Card, ListGroup, Button, Form, Alert, Nav, Badge } from 'react-bootstrap';
import CheckoutForm from './CheckoutForm';
import api from './api';
import { useNavigate, useLocation } from 'react-router-dom';

const stripePromise = loadStripe('pk_test_51O...-placeholder');

const Checkout = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { cart: fullCart, clearSpecifiedItems } = useCart();

    // Use items from location state if provided (Buy Now or Selective Checkout),
    // otherwise fallback to full cart
    const displayItems = location.state?.items || fullCart;

    const [clientSecret, setClientSecret] = useState('');
    const [deliveryType, setDeliveryType] = useState('PICKUP');
    const [paymentMethod, setPaymentMethod] = useState('STRIPE');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Group items by farmer
    const groups = displayItems.reduce((acc, item) => {
        const farmerId = item.farmer?.id || 'unknown';
        if (!acc[farmerId]) {
            acc[farmerId] = {
                farmer: item.farmer || { fullName: 'Local Farmer', id: 'unknown' },
                items: [],
                subtotal: 0
            };
        }
        acc[farmerId].items.push(item);
        acc[farmerId].subtotal += item.price * item.cartQuantity;
        return acc;
    }, {});

    const farmerGroups = Object.values(groups);
    const itemSubtotal = displayItems.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

    // Calculate final totals including delivery fee per group if applicable
    const deliveryFeePerFarmer = deliveryType === 'HOME_DELIVERY' ? 50 : 0;
    const grandTotal = itemSubtotal + (farmerGroups.length * deliveryFeePerFarmer);

    useEffect(() => {
        api.get('/users/profile')
            .then(res => {
                setUserProfile(res.data);
                setLoadingProfile(false);
            })
            .catch(err => {
                console.error("Error fetching profile", err);
                setLoadingProfile(false);
            });
    }, []);

    useEffect(() => {
        if (itemSubtotal > 0 && paymentMethod === 'STRIPE' && !clientSecret) {
            api.post('/payments/create-payment-intent', {
                amount: grandTotal,
                currency: 'inr'
            })
                .then(res => setClientSecret(res.data.clientSecret))
                .catch(err => console.error("Error creating payment intent", err));
        }
    }, [itemSubtotal, paymentMethod, grandTotal]);

    const handlePlaceOrder = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            const orderItems = displayItems.map(item => ({
                productId: item.id,
                quantity: item.cartQuantity
            }));

            const response = await api.post('/orders', {
                items: orderItems,
                deliveryType,
                paymentMethod
            });

            // Clear only the items that were purchased
            clearSpecifiedItems(displayItems.map(i => i.id));

            alert(t('order_success'));
            navigate('/my-orders');
        } catch (err) {
            console.error("Order placement failed", err);
            setError(t('failed_place_order'));
            setIsProcessing(false);
        }
    };

    const appearance = { theme: 'stripe' };
    const options = { clientSecret, appearance };

    if (displayItems.length === 0) {
        return (
            <Container className="my-5 text-center">
                <div className="py-5 bg-white shadow-sm rounded-5">
                    <div className="display-1 mb-4">🛒</div>
                    <h2 className="fw-bold">{t('no_items_checkout')}</h2>
                    <p className="text-muted">{t('empty_checkout_desc')}</p>
                    <Button variant="success" className="rounded-pill px-5 mt-3" onClick={() => navigate('/')}>{t('go_shopping')}</Button>
                </div>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <h2 className="mb-4 fw-bold text-success text-center">{t('checkout_pay')}</h2>
            <Row>
                <Col lg={7} className="mb-4">
                    {/* Delivery Section */}
                    <Card className="shadow-sm border-0 mb-4 rounded-4 overflow-hidden">
                        <Card.Body className="p-4">
                            <h5 className="mb-4 fw-bold d-flex align-items-center gap-2">
                                <span className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '14px' }}>1</span>
                                {t('delivery_prefs')}
                            </h5>
                            <Row className="g-3">
                                <Col md={6}>
                                    <div
                                        className={`p-3 border rounded-4 cursor-pointer transition-all h-100 ${deliveryType === 'PICKUP' ? 'border-success bg-light ring-success' : 'bg-white'}`}
                                        onClick={() => setDeliveryType('PICKUP')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="fw-bold fs-5">🧺 {t('pickup')}</span>
                                            <Form.Check type="radio" checked={deliveryType === 'PICKUP'} readOnly />
                                        </div>
                                        <small className="text-muted d-block">{t('pickup_desc')}</small>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div
                                        className={`p-3 border rounded-4 cursor-pointer transition-all h-100 ${deliveryType === 'HOME_DELIVERY' ? 'border-success bg-light ring-success' : 'bg-white'}`}
                                        onClick={() => setDeliveryType('HOME_DELIVERY')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="fw-bold fs-5">🚚 {t('home_delivery') || t('delivery')}</span>
                                            <Form.Check type="radio" checked={deliveryType === 'HOME_DELIVERY'} readOnly />
                                        </div>
                                        <small className="text-muted d-block">{t('delivery_desc')}</small>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Payment Section */}
                    <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                        <Card.Body className="p-4">
                            <h5 className="mb-4 fw-bold d-flex align-items-center gap-2">
                                <span className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '14px' }}>2</span>
                                {t('payment_method')}
                            </h5>

                            {loadingProfile ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-success spinner-border-sm" role="status"></div>
                                    <p className="mt-2 text-muted small">{t('verifying_details')}</p>
                                </div>
                            ) : !userProfile?.bankAccountNumber && deliveryType !== 'HOME_DELIVERY' ? (
                                <Alert variant="warning" className="rounded-4 border-0 shadow-sm p-4">
                                    <Alert.Heading className="fs-6 fw-bold">🚀 {t('setup_bank_pickup')}</Alert.Heading>
                                    <p className="small mb-3">{t('setup_bank_desc')}</p>
                                    <Button variant="warning" size="sm" className="fw-bold rounded-pill px-4" onClick={() => navigate('/bank-details')}>
                                        {t('setup_now')}
                                    </Button>
                                </Alert>
                            ) : (
                                <>
                                    <Nav variant="pills" activeKey={paymentMethod} onSelect={(k) => setPaymentMethod(k)} className="mb-4 bg-light p-1 rounded-pill">
                                        {['STRIPE', 'UPI', 'COD'].map(m => (
                                            <Nav.Item key={m} className="flex-fill text-center">
                                                <Nav.Link eventKey={m} className="rounded-pill fw-bold small py-2">
                                                    {m === 'STRIPE' ? t('card') : m === 'UPI' ? t('upi') : t('cash')}
                                                </Nav.Link>
                                            </Nav.Item>
                                        ))}
                                    </Nav>

                                    {paymentMethod === 'STRIPE' && (
                                        <div className="p-2 animate__animated animate__fadeIn">
                                            {clientSecret ? (
                                                <Elements options={options} stripe={stripePromise}>
                                                    <CheckoutForm deliveryType={deliveryType} items={displayItems} />
                                                </Elements>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <div className="spinner-border text-success" role="status"></div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {paymentMethod === 'UPI' && (
                                        <div className="animate__animated animate__fadeIn">
                                            <Alert variant="success" className="rounded-4 border-0 shadow-sm py-3 mb-4">
                                                <p className="small mb-0"><strong>{t('pay_farmers_direct')}</strong></p>
                                            </Alert>

                                            <div className="farmer-payment-list">
                                                {farmerGroups.map((group, idx) => {
                                                    const payable = group.subtotal + deliveryFeePerFarmer;
                                                    return (
                                                        <div key={group.farmer.id} className={`mb-4 ${idx !== farmerGroups.length - 1 ? 'border-bottom pb-4' : ''}`}>
                                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                                <div>
                                                                    <div className="fw-bold text-dark fs-5">{group.farmer.fullName}</div>
                                                                    <div className="text-muted small">UPI: {group.farmer.upiId || 'Not Setup'}</div>
                                                                </div>
                                                                <div className="text-end">
                                                                    <div className="text-success fw-bold h4 mb-0">₹{payable.toFixed(2)}</div>
                                                                    <small className="text-muted">incl. fees</small>
                                                                </div>
                                                            </div>
                                                            {group.farmer.upiId ? (
                                                                <div className="text-center">
                                                                    <div className="bg-white p-3 d-inline-block rounded-4 shadow-sm border border-success mb-2">
                                                                        <img
                                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${group.farmer.upiId}&pn=${group.farmer.fullName}&am=${payable.toFixed(2)}&cu=INR`)}`}
                                                                            alt="UPI QR"
                                                                            width="180"
                                                                        />
                                                                    </div>
                                                                    <p className="small text-muted mt-1">{t('scan_for', { name: group.farmer.fullName })}</p>
                                                                </div>
                                                            ) : (
                                                                <Alert variant="danger" className="rounded-3 py-2 small">{t('upi_not_setup')}</Alert>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <Button
                                                variant="success"
                                                className="w-100 py-3 fw-bold mt-4 rounded-pill shadow-sm"
                                                disabled={isProcessing}
                                                onClick={handlePlaceOrder}
                                            >
                                                {isProcessing ? t('finalizing_orders') : t('paid_all_farmers')}
                                            </Button>
                                        </div>
                                    )}

                                    {paymentMethod === 'COD' && (
                                        <div className="py-2 animate__animated animate__fadeIn">
                                            <Alert variant="info" className="rounded-4 border-0 shadow-sm">
                                                <p className="mb-0 small text-center">{t('cod_msg', { amount: grandTotal.toFixed(2) })}</p>
                                            </Alert>
                                            <Button
                                                variant="success"
                                                className="w-100 py-3 fw-bold mt-3 rounded-pill shadow-sm"
                                                disabled={isProcessing}
                                                onClick={handlePlaceOrder}
                                            >
                                                {isProcessing ? t('processing') : t('place_cod_orders')}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {error && <Alert variant="danger" className="mt-3 rounded-3">{error}</Alert>}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={5}>
                    <Card className="shadow-sm border-0 rounded-4 overflow-hidden sticky-top" style={{ top: '20px' }}>
                        <Card.Body className="p-4">
                            <h5 className="mb-4 fw-bold text-success">{t('order_breakdown')}</h5>

                            {farmerGroups.map((group, idx) => (
                                <div key={group.farmer.id} className={`mb-3 ${idx !== farmerGroups.length - 1 ? 'border-bottom pb-3' : ''}`}>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold text-dark">{t('order_for')} {group.farmer.fullName}</span>
                                        <Badge bg="light" text="dark" className="rounded-pill border">{group.items.length} {t('selected')}</Badge>
                                    </div>
                                    <ListGroup variant="flush">
                                        {group.items.map(item => (
                                            <ListGroup.Item key={item.id} className="border-0 px-0 py-1 bg-transparent d-flex justify-content-between align-items-center small">
                                                <div className="text-muted">{t(item.name)} <span className="text-dark">x{item.cartQuantity}{item.unit || 'kg'}</span></div>
                                                <div className="text-dark fw-bold">₹{(item.cartQuantity * item.price).toFixed(2)}</div>
                                            </ListGroup.Item>
                                        ))}
                                        {deliveryType === 'HOME_DELIVERY' && (
                                            <ListGroup.Item className="border-0 px-0 py-1 bg-transparent d-flex justify-content-between align-items-center small text-success">
                                                <div>{t('delivery_fee')}</div>
                                                <div className="fw-bold">₹50.00</div>
                                            </ListGroup.Item>
                                        )}
                                        <ListGroup.Item className="border-0 px-0 pt-2 bg-transparent d-flex justify-content-between align-items-center fw-bold">
                                            <div className="small">{t('subtotal')}</div>
                                            <div className="text-success">₹{(group.subtotal + (deliveryType === 'HOME_DELIVERY' ? 50 : 0)).toFixed(2)}</div>
                                        </ListGroup.Item>
                                    </ListGroup>
                                </div>
                            ))}

                            <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center fs-4 fw-bold text-dark">
                                <span>{t('grand_total')}</span>
                                <span className="text-success">₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                .transition-all { transition: all 0.3s ease; }
                .cursor-pointer { cursor: pointer; }
                .ring-success { border: 2px solid #198754 !important; box-shadow: 0 0 10px rgba(25, 135, 84, 0.1); }
            `}</style>
        </Container>
    );
};

export default Checkout;

