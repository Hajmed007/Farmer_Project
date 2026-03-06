import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from './api';

const BankDetails = () => {
    const { t } = useTranslation();
    const [bankData, setBankData] = useState({
        bankAccountName: '',
        bankAccountNumber: '',
        ifscCode: '',
        upiId: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchBankDetails();
    }, []);

    const fetchBankDetails = async () => {
        try {
            const res = await api.get('/users/profile');
            setBankData({
                bankAccountName: res.data.bankAccountName || '',
                bankAccountNumber: res.data.bankAccountNumber || '',
                ifscCode: res.data.ifscCode || '',
                upiId: res.data.upiId || ''
            });
            setLoading(false);
        } catch (err) {
            setMessage({ type: 'danger', text: t('failed_load_bank') });
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await api.put('/users/bank-details', bankData);
            setMessage({ type: 'success', text: t('bank_saved') });
            setSaving(false);
        } catch (err) {
            setMessage({ type: 'danger', text: t('failed_save_bank') });
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow-sm border-0 rounded-4">
                        <Card.Body className="p-4 p-md-5">
                            <div className="text-center mb-4">
                                <div className="display-4 mb-2">🏦</div>
                                <h2 className="fw-bold">{t('bank_details_title')}</h2>
                                <p className="text-muted small">{t('bank_details_subtitle')}</p>
                            </div>

                            {message.text && <Alert variant={message.type} className="rounded-3">{message.text}</Alert>}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">{t('acc_holder')}</Form.Label>
                                    <Form.Control
                                        value={bankData.bankAccountName}
                                        onChange={(e) => setBankData({ ...bankData, bankAccountName: e.target.value })}
                                        required
                                        placeholder={t('acc_holder_placeholder')}
                                        className="rounded-3"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">{t('acc_num')}</Form.Label>
                                    <Form.Control
                                        value={bankData.bankAccountNumber}
                                        onChange={(e) => setBankData({ ...bankData, bankAccountNumber: e.target.value })}
                                        required
                                        placeholder={t('acc_num_placeholder')}
                                        className="rounded-3"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">{t('upi_vpa')}</Form.Label>
                                    <Form.Control
                                        value={bankData.upiId}
                                        onChange={(e) => setBankData({ ...bankData, upiId: e.target.value.toLowerCase() })}
                                        required
                                        placeholder="e.g. farmer@upi"
                                        className="rounded-3"
                                    />
                                    <Form.Text className="text-muted">{t('upi_hint')}</Form.Text>
                                </Form.Group>

                                <Button
                                    variant="success"
                                    type="submit"
                                    className="w-100 fw-bold py-3 rounded-pill"
                                    disabled={saving}
                                >
                                    {saving ? t('saving_details') : t('save_bank')}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default BankDetails;
