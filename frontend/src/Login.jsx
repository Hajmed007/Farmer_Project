import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const loggedInUser = await login(username, password);
            if (loggedInUser.role === 'ADMIN') {
                navigate('/admin');
            } else if (loggedInUser.role === 'FARMER') {
                navigate('/farmer-dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Login error:', err.response?.data);
            const message = err.response?.data?.message || t('login_failed');
            setError(message);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Card className="shadow-sm border-0" style={{ maxWidth: '400px', width: '100%' }}>
                <Card.Body className="p-4">
                    <h2 className="text-center mb-1 fw-bold text-success">{t('login_title')}</h2>
                    <p className="text-center text-muted small mb-4">{t('login_subtitle')}</p>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('username')}</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={t('username')}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label>{t('password')}</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder={t('password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="success" type="submit" className="w-100 fw-bold py-2 rounded-3 shadow-sm" disabled={username === '' || password === ''}>
                            {t('login')}
                        </Button>
                    </Form>
                    <div className="text-center mt-4 small text-muted">
                        {t('no_account')} <Button variant="link" className="p-0 text-success fw-bold" onClick={() => navigate('/register')}>{t('register_here')}</Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;

