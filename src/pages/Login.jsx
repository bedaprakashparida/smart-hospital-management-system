import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuthContext();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Process Login
        const { email, password } = formData;
        const result = login(email, password);

        if (result.success) {
            // Role-based redirection
            if (result.user.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/'); // Patient dashboard
            }
        } else {
            setErrors({ form: result.message });
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '400px', margin: '4rem auto' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Welcome Back</h2>

                {errors.form && (
                    <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
                        {errors.form}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="john@example.com"
                        />
                        {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-control"
                            placeholder="••••••••"
                        />
                        {errors.password && <span className="form-error">{errors.password}</span>}
                    </div>

                    <button type="submit" className="btn btn-large" style={{ width: '100%', marginTop: '1rem' }}>
                        Log In
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: 0 }}>
                    Don't have a patient account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign Up</Link>
                </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <p><strong>Demo Access</strong></p>
                <p>Admin: admin@hospital.com / admin</p>
                <p>Doctor: doctor1@hospital.com / doctor</p>
                <p>Patient: patient@hospital.com / patient</p>
            </div>
        </div>
    );
};

export default Login;
