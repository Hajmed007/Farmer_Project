import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Nav, Tab, Table, Badge, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from './api';
import { useAuth } from './AuthContext';
import './Dashboard.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'ADMIN') {
            navigate('/');
            return;
        }
        fetchUsers();
        fetchOrders();
        fetchProducts();
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await api.get('/admin/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/admin/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm(t('confirm_cancel_msg'))) {
            try {
                await api.delete(`/admin/users/${userId}`);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user', error);
            }
        }
    };

    if (!user) {
        return (
            <Container className="my-5 text-center">
                <Alert variant="info" className="rounded-4 border-0 shadow-sm p-5">
                    <h2>{t('access_denied')}</h2>
                    <p>{t('insufficient_perms')}</p>
                    <Button variant="primary" onClick={() => navigate('/login')}>{t('login')}</Button>
                </Alert>
            </Container>
        );
    }

    if (user.role !== 'ADMIN') {
        return (
            <Container className="my-5">
                <Alert variant="danger" className="text-center shadow-sm rounded-4 border-0 p-5">
                    <div className="display-1 mb-4">🚫</div>
                    <Alert.Heading className="fw-bold h2 mb-3">{t('access_denied')}</Alert.Heading>
                    <p className="fs-5 text-muted mb-4">
                        {t('insufficient_perms')}<br />
                        <small className="text-danger fw-bold">{t('insufficient_perms_desc')}</small>
                    </p>
                    <Button variant="danger" className="rounded-pill px-5 fw-bold" onClick={() => navigate('/')}>
                        {t('back_to_shop')}
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <h2 className="mb-4 fw-bold text-success text-center">{t('admin_control')}</h2>

            <Tab.Container id="admin-tabs" defaultActiveKey="users">
                <Card className="shadow-sm border-0 rounded-4 overflow-hidden mb-4">
                    <Card.Header className="bg-white p-0 border-0">
                        <Nav variant="tabs" className="nav-justified admin-nav-tabs">
                            <Nav.Item>
                                <Nav.Link eventKey="users" className="py-3 fw-bold border-0 rounded-0 d-flex align-items-center justify-content-center gap-2">
                                    👥 {t('user_mgmt')}
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="products" className="py-3 fw-bold border-0 rounded-0 d-flex align-items-center justify-content-center gap-2">
                                    📦 {t('prod_monitoring')}
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="orders" className="py-3 fw-bold border-0 rounded-0 d-flex align-items-center justify-content-center gap-2">
                                    📜 {t('trans_history')}
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Header>
                    <Tab.Content className="p-4">
                        <Tab.Pane eventKey="users">
                            <h4 className="fw-bold mb-4">{t('all_users')}</h4>
                            <div className="table-responsive">
                                <Table hover align="middle" className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>{t('id')}</th>
                                            <th>{t('username')}</th>
                                            <th>{t('fullname')}</th>
                                            <th>{t('role')}</th>
                                            <th>{t('email')}</th>
                                            <th>{t('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id}>
                                                <td>{u.id}</td>
                                                <td className="fw-bold text-dark">{u.username}</td>
                                                <td>{u.fullName || t('nothing_here')}</td>
                                                <td>
                                                    <Badge bg={u.role === 'ADMIN' ? 'danger' : u.role === 'FARMER' ? 'success' : 'info'} className="rounded-pill px-3 py-2">
                                                        {u.role === 'FARMER' ? t('role_farmer') : u.role === 'CONSUMER' ? t('role_consumer') : u.role}
                                                    </Badge>
                                                </td>
                                                <td>{u.email}</td>
                                                <td>
                                                    {u.username !== user.username && (
                                                        <Button variant="outline-danger" size="sm" className="rounded-pill px-3" onClick={() => handleDeleteUser(u.id)}>
                                                            {t('delete')}
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Tab.Pane>

                        <Tab.Pane eventKey="products">
                            <h4 className="fw-bold mb-4">{t('global_catalog')}</h4>
                            <div className="table-responsive">
                                <Table hover align="middle" className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>{t('image')}</th>
                                            <th>{t('name')}</th>
                                            <th>{t('farmer')}</th>
                                            <th>{t('price')}</th>
                                            <th>{t('stock')}</th>
                                            <th>{t('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(p => (
                                            <tr key={p.id}>
                                                <td>
                                                    <img src={p.imageUrl || FALLBACK_IMAGE} alt="" className="rounded-3" style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                                                </td>
                                                <td className="fw-bold">{t(p.name)}</td>
                                                <td className="small">{p.farmer?.fullName || t('nothing_here')}</td>
                                                <td className="fw-bold text-success">₹{p.price.toFixed(2)}</td>
                                                <td>{p.quantity} {p.unit || 'kg'}</td>
                                                <td>
                                                    <Button variant="outline-danger" size="sm" className="rounded-pill px-3">{t('delete')}</Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Tab.Pane>

                        <Tab.Pane eventKey="orders">
                            <h4 className="fw-bold mb-4">{t('global_logs')}</h4>
                            <div className="table-responsive">
                                <Table hover align="middle" className="mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>{t('order_id')}</th>
                                            <th>{t('consumer')}</th>
                                            <th>{t('total_amount')}</th>
                                            <th>{t('status')}</th>
                                            <th>{t('date_placed')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td className="fw-bold text-dark">#{order.id}</td>
                                                <td>{order.consumer?.fullName || t('nothing_here')}</td>
                                                <td className="fw-bold text-success">₹{order.totalAmount.toFixed(2)}</td>
                                                <td>
                                                    <Badge bg={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'danger' : 'warning'} className="rounded-pill px-3 py-2">
                                                        {t(order.status.toLowerCase())}
                                                    </Badge>
                                                </td>
                                                <td className="small text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </Tab.Pane>
                    </Tab.Content>
                </Card>
            </Tab.Container>
        </Container>
    );
};

export default AdminDashboard;
