import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const { currentUser, logout } = useAuthContext();

    const isActive = (path) => {
        return location.pathname === path ? 'nav-link active' : 'nav-link';
    };

    const getHomeLink = () => {
        if (currentUser?.role === 'Admin') return '/admin';
        if (currentUser?.role === 'Doctor') return '/doctor';
        return '/';
    }

    return (
        <nav className="navbar">
            <Link to={getHomeLink()} className="nav-brand">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                HealthConnect
            </Link>

            <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
                {(!currentUser || currentUser?.role === 'Patient') && (
                    <Link to="/" className={isActive('/')}>Home</Link>
                )}

                {currentUser?.role === 'Patient' && (
                    <>
                        <Link to="/submit-query" className={isActive('/submit-query')}>Health Query</Link>
                        <Link to="/book-appointment" className={isActive('/book-appointment')}>Book Appointment</Link>
                        <Link to="/status" className={isActive('/status')}>Check Status</Link>
                    </>
                )}

                {currentUser?.role === 'Admin' && (
                    <Link to="/admin" className={isActive('/admin')}>Admin</Link>
                )}

                {currentUser?.role === 'Doctor' && (
                    <Link to="/doctor" className={isActive('/doctor')}>Doctor Dashboard</Link>
                )}

                <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)', margin: '0 1rem' }}></div>

                {currentUser ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>
                            {currentUser.name} <span className="badge" style={{ marginLeft: '0.5rem', backgroundColor: 'var(--secondary)', color: 'var(--primary)' }}>{currentUser.role}</span>
                        </span>
                        <button
                            onClick={logout}
                            className="btn btn-outline"
                            style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to="/login" className="btn btn-outline">Log In</Link>
                        <Link to="/signup" className="btn btn-yellow">Sign Up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
