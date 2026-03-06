import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Auth.css';

const Verification = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Fallback if accessed without state
    const email = location.state?.email || '';

    return (
        <div className="auth-container">
            <h2>{t('verify_email_title')}</h2>
            <div className="dashboard-section fade-in" style={{ textAlign: 'center' }}>
                <p>
                    {t('verification_link_sent', { email: email || t('email') })}
                </p>
                <p style={{ marginTop: '15px', color: '#666' }}>
                    {t('click_link_to_enable')}
                </p>
                <button
                    onClick={() => navigate('/login')}
                    className="btn-primary"
                    style={{ marginTop: '20px' }}
                >
                    {t('back_to_login')}
                </button>
            </div>
        </div>
    );
};

export default Verification;
