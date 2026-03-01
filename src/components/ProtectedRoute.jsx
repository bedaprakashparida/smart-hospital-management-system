import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { currentUser } = useAuthContext();

    if (!currentUser) {
        // Not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    // If specific roles are required and user doesn't have one
    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        // Redirect based on their role
        if (currentUser.role === 'Admin') {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/" replace />;
    }

    // Authorized
    return children;
};

export default ProtectedRoute;
