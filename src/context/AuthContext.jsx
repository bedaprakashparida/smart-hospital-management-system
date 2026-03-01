import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Pre-seed an admin user and a doctor user if not present
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('users');
        let parsedUsers = saved ? JSON.parse(saved) : [];

        // Ensure admin exists
        if (!parsedUsers.find(u => u.email === 'admin@hospital.com')) {
            parsedUsers.push({
                id: 'admin_1',
                name: 'Hospital Admin',
                email: 'admin@hospital.com',
                phone: '1234567890',
                password: 'admin',
                role: 'Admin'
            });
        }

        // Ensure a default Doctor exists
        if (!parsedUsers.find(u => u.email === 'doctor1@hospital.com')) {
            parsedUsers.push({
                id: 'doc_1',
                name: 'Dr. Jane Smith',
                email: 'doctor1@hospital.com',
                phone: '0987654321',
                password: 'doctor',
                role: 'Doctor'
            });
        }

        // Ensure a default Patient exists
        if (!parsedUsers.find(u => u.email === 'patient@hospital.com')) {
            parsedUsers.push({
                id: 'pat_1',
                name: 'Test Patient',
                email: 'patient@hospital.com',
                phone: '1122334455',
                password: 'patient',
                role: 'Patient'
            });
        }

        localStorage.setItem('users', JSON.stringify(parsedUsers));

        return parsedUsers;
    });

    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }, [currentUser]);

    const signup = (userData) => {
        // Check if email exists
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered.' };
        }

        const newUser = {
            ...userData,
            id: Date.now().toString(),
            role: userData.role || 'Patient' // Allow specified role or default to Patient
        };

        setUsers([...users, newUser]);
        setCurrentUser(newUser); // Auto login after signup
        return { success: true };
    };

    const login = (email, password) => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
            return { success: true, user };
        }
        return { success: false, message: 'Invalid email or password.' };
    };

    const logout = () => {
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{
            users,
            currentUser,
            signup,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};
