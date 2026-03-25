import React from 'react';

const Login: React.FC = () => {
    return (
        <section className="cyber-section-card">
            <p className="cyber-page-kicker">Authentication</p>
            <h1 className="cyber-standalone-title">Login Required</h1>
            <p style={{ marginTop: '12px', color: '#cbd5e1' }}>
                Your session is not valid. Please login again to continue.
            </p>
        </section>
    );
};

export default Login;
