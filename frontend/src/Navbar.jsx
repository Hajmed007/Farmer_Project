import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown, Badge, ButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import api from './api';

const NavigationBar = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [pulse, setPulse] = React.useState(false);
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);

    const cartCount = cart.reduce((total, item) => total + item.cartQuantity, 0);

    React.useEffect(() => {
        if (cartCount > 0) {
            setPulse(true);
            const timer = setTimeout(() => setPulse(false), 500);
            return () => clearTimeout(timer);
        }
    }, [cartCount]);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            const countRes = await api.get('/notifications/unread-count');
            setUnreadCount(countRes.data);
        } catch (err) {
            console.error("Error fetching notifications", err);
        }
    };

    React.useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Check ogni 30s
        return () => clearInterval(interval);
    }, [user]);

    const handleMarkAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error("Error marking as read", err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold">
                    🌾 {t('brand_name')}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">{t('home')}</Nav.Link>
                        {user && user.role === 'FARMER' && (
                            <Nav.Link as={Link} to="/farmer-dashboard">{t('farmer_dashboard')}</Nav.Link>
                        )}
                        {user && user.role === 'ADMIN' && (
                            <Nav.Link as={Link} to="/admin">{t('admin_panel')}</Nav.Link>
                        )}
                    </Nav>
                    <Nav>
                        {user ? (
                            <>
                                {user.role === 'CONSUMER' && (
                                    <>
                                        <Nav.Link as={Link} to="/cart" className={`position-relative me-3 cart-link ${pulse ? 'pulse-cart' : ''}`}>
                                            🛒 {t('cart')}
                                            {cartCount > 0 && (
                                                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.65rem' }}>
                                                    {cartCount}
                                                </Badge>
                                            )}
                                        </Nav.Link>
                                        <Nav.Link as={Link} to="/my-orders" className="me-3">{t('my_orders')}</Nav.Link>
                                    </>
                                )}

                                <NavDropdown
                                    title={
                                        <div className="position-relative d-inline-block">
                                            🔔
                                            {unreadCount > 0 && (
                                                <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.6rem' }}>
                                                    {unreadCount}
                                                </Badge>
                                            )}
                                        </div>
                                    }
                                    id="notifications-dropdown"
                                    align="end"
                                    className="me-3 no-caret"
                                >
                                    <div style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                                        <div className="p-2 border-bottom fw-bold d-flex justify-content-between align-items-center">
                                            <span>{t('notifications')}</span>
                                            {unreadCount > 0 && <small className="text-muted fw-normal" style={{ fontSize: '0.7rem' }}>{unreadCount} {t('unread')}</small>}
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div className="p-3 text-center text-muted small">{t('no_notifications')}</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div key={n.id} className={`p-2 border-bottom small ${!n.read ? 'bg-light' : ''}`} onClick={() => !n.read && handleMarkAsRead(n.id)} style={{ cursor: n.read ? 'default' : 'pointer' }}>
                                                    <div className={!n.read ? 'fw-bold' : ''}>{n.message}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                        {new Date(n.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </NavDropdown>

                                <NavDropdown title={t('hi_user', { name: user.username })} id="user-dropdown" align="end">
                                    <NavDropdown.Item as={Link} to="/profile">👤 {t('profile')}</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/bank-details">🏦 {t('bank_account')}</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout} className="text-danger">{t('logout')}</NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">{t('login')}</Nav.Link>
                                <Nav.Link as={Link} to="/register">{t('register')}</Nav.Link>
                            </>
                        )}

                        <ButtonGroup size="sm" className="ms-3 align-self-center">
                            <Button variant={i18n.language === 'en' ? 'success' : 'outline-light'} onClick={() => changeLanguage('en')}>EN</Button>
                            <Button variant={i18n.language === 'ta' ? 'success' : 'outline-light'} onClick={() => changeLanguage('ta')}>தமிழ்</Button>
                        </ButtonGroup>
                    </Nav>
                </Navbar.Collapse>
            </Container>
            <style>{`
                .cart-link { transition: all 0.3s ease; }
                .pulse-cart { transform: scale(1.2); color: #91e174 !important; }
                @keyframes cart-bounce {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
                .pulse-cart { animation: cart-bounce 0.5s ease-in-out; }
                .no-caret::after { display: none !important; }
            `}</style>
        </Navbar>
    );
};

export default NavigationBar;

