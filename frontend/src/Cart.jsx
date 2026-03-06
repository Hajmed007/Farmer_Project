import React from 'react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { Container, Table, Button, Card, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import api from './api';
import { useTranslation } from 'react-i18next';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
    const [selectedIds, setSelectedIds] = React.useState(cart.map(i => i.id));
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Re-sync selectedIds if cart changes (e.g. items removed)
    React.useEffect(() => {
        const cartIds = cart.map(i => i.id);
        setSelectedIds(prev => prev.filter(id => cartIds.includes(id)));
    }, [cart]);

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCheckout = () => {
        const selectedItems = cart.filter(item => selectedIds.includes(item.id));
        if (selectedItems.length === 0) {
            alert(t('select_at_least_one'));
            return;
        }
        navigate('/checkout', { state: { items: selectedItems } });
    };

    const handleBuyNow = (item) => {
        navigate('/checkout', { state: { items: [item] } });
    };

    const selectedTotal = cart
        .filter(item => selectedIds.includes(item.id))
        .reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

    return (
        <Container className="my-5">
            <h2 className="mb-4 text-center fw-bold text-success">🛒 {t('cart_title')}</h2>
            {cart.length === 0 ? (
                <div className="text-center py-5">
                    <h4 className="text-muted">{t('cart_empty')}</h4>
                    <Button variant="success" className="mt-3 px-4" onClick={() => navigate('/')}>{t('continue_shopping')}</Button>
                </div>
            ) : (
                <Row>
                    <Col lg={8}>
                        <Card className="shadow-sm border-0 mb-4">
                            <Card.Body className="p-0">
                                <Table responsive hover className="mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th width="40" className="text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.length === cart.length && cart.length > 0}
                                                    onChange={() => {
                                                        if (selectedIds.length === cart.length) setSelectedIds([]);
                                                        else setSelectedIds(cart.map(i => i.id));
                                                    }}
                                                />
                                            </th>
                                            <th>{t('product_name')}</th>
                                            <th>{t('price')}</th>
                                            <th className="text-center">{t('quantity')}</th>
                                            <th className="text-end">{t('subtotal')}</th>
                                            <th className="text-center">{t('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="align-middle">
                                        {cart.map(item => (
                                            <tr key={item.id} className={selectedIds.includes(item.id) ? 'bg-light' : ''}>
                                                <td className="text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(item.id)}
                                                        onChange={() => toggleSelect(item.id)}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="fw-bold">{item.name}</div>
                                                    <small className="text-muted">{t('sold_by')}: {item.farmerName || t('local_farmer')}</small>
                                                </td>
                                                <td>₹{item.price.toFixed(2)}</td>
                                                <td>
                                                    <div className="d-flex justify-content-center align-items-center">
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                                                            disabled={item.cartQuantity <= 1}
                                                        >-</Button>
                                                        <span className="mx-3 fw-bold">{item.cartQuantity} {item.unit || 'kg'}</span>
                                                        <Button
                                                            variant="outline-secondary"
                                                            size="sm"
                                                            onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                                                            disabled={item.cartQuantity >= item.stock}
                                                        >+</Button>
                                                    </div>
                                                </td>
                                                <td className="text-end">₹{(item.price * item.cartQuantity).toFixed(2)}</td>
                                                <td className="text-center">
                                                    <div className="d-flex flex-column gap-1 align-items-center">
                                                        <Button variant="success" size="sm" className="rounded-pill px-3 py-1" style={{ fontSize: '0.75rem' }} onClick={() => handleBuyNow(item)}>
                                                            {t('buy_now')}
                                                        </Button>
                                                        <Button variant="link" className="text-danger p-0 small" style={{ fontSize: '0.75rem', textDecoration: 'none' }} onClick={() => removeFromCart(item.id)}>
                                                            {t('remove')}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4}>
                        <Card className="shadow-sm border-0 bg-light p-3">
                            <Card.Body>
                                <h4 className="fw-bold mb-4 text-success text-center">{t('order_summary')}</h4>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>{t('selected')} ({selectedIds.length})</span>
                                    <span>₹{selectedTotal.toFixed(2)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2 text-muted">
                                    <span>{t('delivery')}</span>
                                    <span className="text-success">{t('free')}</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-4 fw-bold fs-5">
                                    <span>{t('total')}</span>
                                    <span className="text-success">₹{selectedTotal.toFixed(2)}</span>
                                </div>
                                <Button
                                    variant="success"
                                    className="w-100 py-3 fw-bold shadow-sm"
                                    size="lg"
                                    onClick={handleCheckout}
                                >
                                    {t('proceed_checkout')}
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    className="w-100 mt-3 border-0"
                                    onClick={() => navigate('/')}
                                >
                                    ← {t('back_to_shop')}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default Cart;

