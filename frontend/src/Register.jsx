import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Container, Form, Button, Card, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const Register = () => {
    const [countryCode, setCountryCode] = useState('+91');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'CONSUMER',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        upiId: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const countries = [
        { name: 'India', code: '+91' },
        { name: 'Australia', code: '+61' },
        { name: 'USA', code: '+1' },
        { name: 'UK', code: '+44' }
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (cleanPhone.length < 8) {
            setError(t('failed_confirm_delivery')); // Using a generic error or I should add a specific one
            setIsLoading(false);
            return;
        }

        const fullPhone = countryCode + cleanPhone;

        try {
            const result = await register({ ...formData, phone: fullPhone });
            // Automatic login handled by AuthContext
            if (result.role === 'FARMER') {
                navigate('/farmer-dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page" style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f5e9 100%)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center'
        }}>
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={10} xl={8}>
                        <Card className="shadow-lg border-0 overflow-hidden rounded-4">
                            <Row className="g-0">
                                <Col md={5} className="d-none d-md-block position-relative" style={{
                                    overflow: 'hidden'
                                }}>
                                    {/* Dynamic Role Image with Animation */}
                                    <div
                                        key={formData.role}
                                        className="h-100 w-100 animate__animated animate__fadeIn"
                                        style={{
                                            background: `url(${formData.role === 'FARMER'
                                                ? 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800&auto=format&fit=crop'
                                                : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop'}) center/cover`,
                                            transition: 'background 0.5s ease-in-out'
                                        }}
                                    >
                                        <div className="h-100 w-100 p-5 d-flex flex-column justify-content-end text-white" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                            <div className="animate__animated animate__slideInUp animate__faster">
                                                <h3 className="fw-bold mb-3">
                                                    {formData.role === 'FARMER' ? t('ready_to_sell') || 'Ready to Sell?' : t('ready_to_shop') || 'Ready to Shop?'}
                                                </h3>
                                                <p className="opacity-90 fs-6">
                                                    {formData.role === 'FARMER'
                                                        ? t('farmer_desc_short') || 'List your fresh harvests and connect directly with local communities.'
                                                        : t('consumer_desc_short') || 'Access fresh, organic, and locally-sourced produce directly from the source.'}
                                                </p>
                                                <div className="mt-4 pt-3 border-top border-white-50">
                                                    <small className="opacity-75">Join thousands of others in the</small>
                                                    <h5 className="fw-bold text-success-light">Farmer Market Community</h5>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={7}>
                                    <Card.Body className="p-4 p-lg-5">
                                        <div className="text-center mb-4">
                                            <span className="fs-1">🌾</span>
                                            <h2 className="fw-bold text-success mt-2">{t('register_title')}</h2>
                                            <p className="text-muted">{t('register_subtitle')}</p>
                                        </div>

                                        {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

                                        <Form onSubmit={handleSubmit}>
                                            <Row className="mb-3">
                                                <Col md={12}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold">{t('i_am_a')}</Form.Label>
                                                        <div className="d-flex gap-3">
                                                            <div
                                                                className={`flex-fill p-3 border rounded-3 text-center cursor-pointer ${formData.role === 'CONSUMER' ? 'border-success bg-light ring-success' : ''}`}
                                                                style={{ cursor: 'pointer', transition: '0.2s' }}
                                                                onClick={() => setFormData({ ...formData, role: 'CONSUMER' })}
                                                            >
                                                                <div className="fs-4 mb-1">🛒</div>
                                                                <div className="fw-bold small">{t('role_consumer')}</div>
                                                                <Form.Check
                                                                    type="radio"
                                                                    className="d-none"
                                                                    checked={formData.role === 'CONSUMER'}
                                                                    readOnly
                                                                />
                                                            </div>
                                                            <div
                                                                className={`flex-fill p-3 border rounded-3 text-center cursor-pointer ${formData.role === 'FARMER' ? 'border-success bg-light' : ''}`}
                                                                style={{ cursor: 'pointer', transition: '0.2s' }}
                                                                onClick={() => setFormData({ ...formData, role: 'FARMER' })}
                                                            >
                                                                <div className="fs-4 mb-1">👩‍🌾</div>
                                                                <div className="fw-bold small">{t('role_farmer')}</div>
                                                                <Form.Check
                                                                    type="radio"
                                                                    className="d-none"
                                                                    checked={formData.role === 'FARMER'}
                                                                    readOnly
                                                                />
                                                            </div>
                                                        </div>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Row className="mb-3 g-3">
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold">{t('username')}</Form.Label>
                                                        <Form.Control name="username" onChange={handleChange} required placeholder={t('username')} className="rounded-3 p-2 py-2" />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold">{t('fullname')}</Form.Label>
                                                        <Form.Control name="fullName" onChange={handleChange} required placeholder={t('fullname')} className="rounded-3 p-2 py-2" />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold">{t('email')}</Form.Label>
                                                <Form.Control type="email" name="email" onChange={handleChange} required placeholder={t('email_placeholder')} className="rounded-3 p-2 py-2" />
                                            </Form.Group>

                                            <Row className="mb-3 g-3">
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold">{t('password')}</Form.Label>
                                                        <Form.Control type="password" name="password" onChange={handleChange} required placeholder="••••••••" className="rounded-3 p-2 py-2" />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group>
                                                        <Form.Label className="small fw-bold">{t('phone')}</Form.Label>
                                                        <InputGroup>
                                                            <Form.Select
                                                                className="rounded-start-3"
                                                                style={{ maxWidth: '85px' }}
                                                                value={countryCode}
                                                                onChange={(e) => setCountryCode(e.target.value)}
                                                            >
                                                                {countries.map(c => (
                                                                    <option key={c.code} value={c.code}>{c.code}</option>
                                                                ))}
                                                            </Form.Select>
                                                            <Form.Control
                                                                name="phone"
                                                                type="tel"
                                                                placeholder="1234567890"
                                                                onChange={handleChange}
                                                                required
                                                                className="rounded-end-3"
                                                            />
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-4">
                                                <Form.Label className="small fw-bold">{t('address')}</Form.Label>
                                                <Form.Control name="address" onChange={handleChange} placeholder={t('address_placeholder')} as="textarea" rows={2} className="rounded-3" />
                                            </Form.Group>

                                            {formData.role === 'FARMER' && (
                                                <Form.Group className="mb-4">
                                                    <Form.Label className="small fw-bold">{t('upi_id')} ({t('to_receive_payments') || 'to receive payments'})</Form.Label>
                                                    <Form.Control
                                                        name="upiId"
                                                        onChange={(e) => setFormData({ ...formData, upiId: e.target.value.toLowerCase() })}
                                                        placeholder="e.g. yourname@upi"
                                                        required={formData.role === 'FARMER'}
                                                        className="rounded-3 p-2 border-success"
                                                    />
                                                    <Form.Text className="text-muted small">This ID will be used to generate your payment QR code.</Form.Text>
                                                </Form.Group>
                                            )}

                                            <Button variant="success" type="submit" className="w-100 fw-bold py-3 rounded-pill shadow-sm" disabled={isLoading}>
                                                {isLoading ? t('creating_account') : t('register_now')}
                                            </Button>
                                        </Form>

                                        <div className="text-center mt-4 pt-2 border-top">
                                            <span className="text-muted small">{t('already_have_account')}</span>
                                            <Button variant="link" className="p-0 ms-2 text-success fw-bold small" onClick={() => navigate('/login')}>{t('login_here')}</Button>
                                        </div>
                                    </Card.Body>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Register;


