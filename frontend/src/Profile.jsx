import { Container, Row, Col, Card, Form, Button, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from './api';
import { useAuth } from './AuthContext';

const Profile = () => {
    const { t } = useTranslation();
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        api.get('/users/profile')
            .then(res => {
                setProfile({
                    fullName: res.data.fullName || '',
                    email: res.data.email || '',
                    phone: res.data.phone || '',
                    address: res.data.address || ''
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching profile", err);
                setError(t('failed_load_profile'));
                setLoading(false);
            });
    }, [t]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await api.put('/users/profile', profile);
            setShowToast(true);
        } catch (err) {
            console.error("Error updating profile", err);
            setError(t('failed_update_profile'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container className="my-5 text-center">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2 text-muted">{t('loading_profile')}</p>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow-lg border-0 rounded-4 overflow-hidden animate__animated animate__fadeIn">
                        <div className="bg-success py-4 text-center text-white">
                            <div className="display-4 mb-2">👤</div>
                            <h3 className="fw-bold mb-0">{t('my_profile')}</h3>
                            <p className="opacity-75 small">{t('update_personal_info')}</p>
                        </div>
                        <Card.Body className="p-4 p-md-5">
                            {error && <Alert variant="danger" className="rounded-3 mb-4 small">{error}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">{t('fullname')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="fullName"
                                        value={profile.fullName}
                                        onChange={handleChange}
                                        placeholder={t('fullname_placeholder')}
                                        className="py-2 rounded-3"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">{t('email')}</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleChange}
                                        placeholder={t('email_placeholder')}
                                        className="py-2 rounded-3"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">{t('phone')}</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        placeholder={t('phone_placeholder')}
                                        className="py-2 rounded-3"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-5">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">{t('primary_address')}</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="address"
                                        value={profile.address}
                                        onChange={handleChange}
                                        placeholder={t('address_placeholder')}
                                        className="py-2 rounded-3"
                                    />
                                    <Form.Text className="text-muted small">
                                        {t('address_hint')}
                                    </Form.Text>
                                </Form.Group>

                                <Button
                                    variant="success"
                                    type="submit"
                                    className="w-100 py-3 fw-bold rounded-pill shadow-sm mt-2"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            {t('saving')}
                                        </>
                                    ) : t('save_profile')}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>

                    <div className="mt-4 text-center text-muted small">
                        {t('logged_in_as')} <span className="fw-bold">{authUser.username}</span> ({authUser.role})
                    </div>
                </Col>
            </Row>

            <ToastContainer position="bottom-center" className="p-3">
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide className="border-0 shadow-lg rounded-4 overflow-hidden">
                    <Toast.Header closeButton={false} className="bg-success text-white border-0 py-2">
                        <strong className="me-auto">{t('success')}</strong>
                        <small>{t('just_now')}</small>
                    </Toast.Header>
                    <Toast.Body className="bg-white py-3 fs-6">
                        {t('profile_updated')}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </Container>
    );
};

export default Profile;
