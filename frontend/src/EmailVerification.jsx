import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from './api';
import './Auth.css';

const EmailVerification = () => {
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const [status, setStatus] = useState(t('verifying_email_status'));
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const token = searchParams.get('token');

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setError(t('no_token_found'));
                return;
            }
            try {
                await api.post(`/auth/verify-email?token=${token}`);
                setStatus(t('email_verified_success'));
                setTimeout(() => navigate('/login'), 3000);
            } catch (err) {
                const msg = err.response?.data?.message || err.response?.data || t('verification_failed_desc');
                setError(msg);
            }
        };
        verify();
    }, [token, navigate, t]);

    return (
        <div className="auth-container">
            <h2>{t('verify_email_title')}</h2>
            {!error ? (
                <div className="status-badge confirmed" style={{ padding: '20px', display: 'block' }}>
                    {status}
                </div>
            ) : (
                <div className="error" style={{ padding: '20px' }}>
                    {error}
                </div>
            )}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button onClick={() => navigate('/login')} className="btn-secondary">{t('go_to_login')}</button>
            </div>
        </div>
    );
};

export default EmailVerification;
