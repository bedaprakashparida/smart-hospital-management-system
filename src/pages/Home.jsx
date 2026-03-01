import { useState } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    const handleSendOtp = async () => {
        if (!phone) {
            setMessage('Please enter your phone number.');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: phone })
            });
            const data = await response.json();

            if (data.success) {
                setIsOtpSent(true);
                setMessage('OTP sent to your phone.');
                setMessageType('success');
            } else {
                setMessage(data.error || 'Failed to send OTP.');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Network error. Failed to send OTP.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!otp) {
            setMessage('Please enter the OTP.');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber: phone, code: otp, name: name })
            });
            const data = await response.json();

            if (data.success) {
                setMessage('Appointment request verified and submitted!');
                setMessageType('success');
                // Reset form after a few seconds
                setTimeout(() => {
                    setName('');
                    setPhone('');
                    setOtp('');
                    setIsOtpSent(false);
                    setMessage('');
                }, 4000);
            } else {
                setMessage(data.error || 'Invalid OTP. Please try again.');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Network error. Failed to verify OTP.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fade-in">
            {/* Hero Section */}
            <div className="apollo-hero">
                <div className="grid grid-cols-2" style={{ maxWidth: '1200px', margin: '0 auto', alignItems: 'center', gap: '3rem' }}>
                    {/* Left Column */}
                    <div>
                        <h1 className="apollo-heading">
                            Your health is in <span>safe hands</span> <br /> at HealthConnect
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                            Share your details. We'll help you find the right doctor and support you till recovery.
                        </p>

                        <div className="apollo-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            Insurance Support & Affordable Treatment Cost
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <Link to="/submit-query" className="apollo-feature-card" style={{ flex: '1 1 120px' }}>
                                <div className="apollo-feature-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
                                    </svg>
                                </div>
                                Submit Query
                            </Link>
                            <Link to="/book-appointment" className="apollo-feature-card" style={{ flex: '1 1 120px' }}>
                                <div className="apollo-feature-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </div>
                                Book Appointment
                            </Link>
                            <Link to="/status" className="apollo-feature-card" style={{ flex: '1 1 120px' }}>
                                <div className="apollo-feature-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                </div>
                                Check Status
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div>
                        <div className="apollo-form-card">
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)', fontWeight: 600 }}>Get the Right Care, Skip the Waiting</h3>

                            {message && (
                                <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ marginBottom: '1rem', padding: '0.75rem', fontSize: '0.9rem' }}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp}>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isLoading || isOtpSent}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="tel"
                                        className="form-control"
                                        placeholder="Phone Number (+1234567890)"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        disabled={isLoading || isOtpSent}
                                        required
                                    />
                                </div>

                                {!isOtpSent ? (
                                    <button
                                        type="button"
                                        className="btn"
                                        style={{ width: '100%', marginBottom: '1rem' }}
                                        onClick={handleSendOtp}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Sending...' : 'Send OTP'}
                                    </button>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                disabled={isLoading}
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-yellow"
                                            style={{ width: '100%' }}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Verifying...' : 'Submit Now'}
                                        </button>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Steps Section */}
            <div style={{ maxWidth: '900px', margin: '4rem auto', padding: '0 1rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.75rem', color: 'var(--text-main)' }}>
                    How to Skip the Wait Time at <span style={{ color: 'var(--primary)' }}>HealthConnect</span>
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '0.95rem' }}>
                    Finding the right care is easy at HealthConnect. From booking an appointment to meeting the right doctor, our team guides you at every step.
                </p>

                <div className="apollo-step-card">
                    <div className="apollo-step-icon bg-blue">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Share your details or Give us a Call</h4>
                    </div>
                    <div className="apollo-step-number">01</div>
                </div>

                <div className="apollo-step-card">
                    <div className="apollo-step-icon bg-green">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Our healthcare team will connect with you instantly</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Get personalized assistance from our dedicated healthcare experts</p>
                    </div>
                    <div className="apollo-step-number">02</div>
                </div>

                <div className="apollo-step-card">
                    <div className="apollo-step-icon bg-orange">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Choose the doctor and appointment time that works for you</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Select from available slots that fit your schedule</p>
                    </div>
                    <div className="apollo-step-number">03</div>
                </div>

                <div className="apollo-step-card">
                    <div className="apollo-step-icon bg-purple">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Reach the hospital just 10 minutes before your appointment slot</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>No more long waiting times - we value your time</p>
                    </div>
                    <div className="apollo-step-number">04</div>
                </div>
            </div>
        </div>
    );
};

export default Home;
