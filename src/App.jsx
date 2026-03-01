import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import SubmitQuery from './pages/SubmitQuery';
import BookAppointment from './pages/BookAppointment';
import CheckStatus from './pages/CheckStatus';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  const { currentUser } = useAuthContext();

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!currentUser ? <Signup /> : <Navigate to="/" />} />

            {/* Patient & Public Hub */}
            <Route path="/" element={
              currentUser?.role === 'Admin' ? <Navigate to="/admin" replace /> :
                currentUser?.role === 'Doctor' ? <Navigate to="/doctor" replace /> :
                  <Home />
            } />

            {/* Patient Routes (Protected) */}
            <Route path="/submit-query" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <SubmitQuery />
              </ProtectedRoute>
            } />
            <Route path="/book-appointment" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <BookAppointment />
              </ProtectedRoute>
            } />
            <Route path="/status" element={
              <ProtectedRoute allowedRoles={['Patient']}>
                <CheckStatus />
              </ProtectedRoute>
            } />

            {/* Admin Routes (Protected) */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            {/* Doctor Routes (Protected) */}
            <Route path="/doctor" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <footer>
          <p>&copy; {new Date().getFullYear()} HealthConnect. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
