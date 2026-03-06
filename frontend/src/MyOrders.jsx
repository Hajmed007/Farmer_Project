import React, { useEffect, useState } from 'react';
import api from './api';
import { Container, Card, Table, Badge, Button, Row, Col, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const MyOrders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders/my-orders');
            setOrders(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching orders', error);
            setError(t('failed_load_orders'));
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelivery = async (orderId) => {
        if (!window.confirm(t('confirm_receipt_msg'))) return;

        try {
            await api.put(`/orders/${orderId}/status?status=DELIVERED`);
            alert(t('confirm_delivered_alert'));
            fetchOrders();
        } catch (error) {
            console.error('Error confirming delivery', error);
            alert(t('failed_confirm_delivery'));
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm(t('confirm_cancel_msg'))) return;

        try {
            await api.post(`/orders/${orderId}/cancel`);
            alert(t('cancel_success'));
            fetchOrders();
        } catch (error) {
            console.error('Error cancelling order', error);
            alert(error.response?.data?.message || t('failed_cancel'));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <Badge bg="warning" text="dark">{t('pending')}</Badge>;
            case 'CONFIRMED': return <Badge bg="info">{t('confirmed')}</Badge>;
            case 'SHIPPED': return <Badge bg="primary">{t('shipped')}</Badge>;
            case 'DELIVERED': return <Badge bg="success">{t('delivered')}</Badge>;
            case 'CANCELLED': return <Badge bg="danger">{t('cancelled')}</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
        }
    };

    if (loading) return <Container className="mt-5 text-center"><p>{t('loading_orders')}</p></Container>;

    return (
        <Container className="my-5">
            <h2 className="mb-4 text-center fw-bold text-success">{t('my_orders')}</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {orders.length === 0 ? (
                <div className="text-center py-5">
                    <h4>{t('no_orders')}</h4>
                    <Button variant="outline-success" className="mt-3" onClick={() => window.location.href = '/'}>{t('start_shopping')}</Button>
                </div>
            ) : (
                <Row>
                    {orders.map(order => (
                        <Col key={order.id} xs={12} className="mb-4">
                            <Card className="shadow-sm border-0">
                                <Card.Header className="bg-light p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <h5 className="mb-0 fw-bold">{t('order_no')}{order.id}</h5>
                                            <small className="text-muted">{new Date(order.createdAt).toLocaleString()}</small>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            {getStatusBadge(order.status)}
                                            {order.status === 'SHIPPED' && (
                                                <Button variant="success" size="sm" onClick={() => handleConfirmDelivery(order.id)}>
                                                    {t('confirm_receipt')} ✅
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {order.items[0]?.product?.farmer && (
                                        <div className="mt-2 pt-2 border-top d-flex align-items-center gap-2 text-dark">
                                            <span className="fs-5">👨‍🌾</span>
                                            <div className="small">
                                                {t('sold_by')}: <strong>{order.items[0].product.farmer.fullName}</strong>
                                                <span className="mx-2 text-muted">|</span>
                                                📍 {order.items[0].product.farmer.address}
                                            </div>
                                        </div>
                                    )}
                                </Card.Header>
                                <Card.Body>
                                    <Table hover responsive className="mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>{t('product')}</th>
                                                <th className="text-center">{t('quantity')} ({t('unit')})</th>
                                                <th className="text-end">{t('price')} (₹)</th>
                                                <th className="text-end">{t('subtotal')} (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map(item => (
                                                <tr key={item.id}>
                                                    <td>{item.product.name}</td>
                                                    <td className="text-center">{item.quantity}</td>
                                                    <td className="text-end">₹{item.price.toFixed(2)}</td>
                                                    <td className="text-end">₹{(item.price * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="fw-bold">
                                                <td colSpan="3" className="text-end">{t('total_amount')}:</td>
                                                <td className="text-end text-success">₹{order.totalAmount.toFixed(2)}</td>
                                            </tr>
                                            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                                                <tr>
                                                    <td colSpan="4" className="text-end border-0 pt-3">
                                                        <Button variant="outline-danger" size="sm" className="rounded-pill px-3" onClick={() => handleCancelOrder(order.id)}>
                                                            {t('cancel_order')}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )}
                                        </tfoot>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default MyOrders;

