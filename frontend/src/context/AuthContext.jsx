import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for saved user session on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        try {
            const response = await api.post('/teacher/login', formData);
            const { user, session } = response.data;

            // Store session and user
            localStorage.setItem('access_token', session.access_token);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            toast.success('Welcome back!');
            return true;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const signup = async (email, password) => {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        try {
            await api.post('/teacher/signup', formData);
            toast.success('Account created! Please login.');
            return true;
        } catch (error) {
            console.error("Signup error:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        setUser(null);
        toast.success('Logged out successfully');
    };

    const value = {
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
