import React, { createContext, useState, useEffect, useContext } from 'react';
import api from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user'); // Basic user info
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const { token, role, username: dbUsername } = response.data;

            localStorage.setItem('token', token);
            const userData = { username: dbUsername, role };
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Login failed', error);
            throw error; // Throw error to be caught by login component
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            const { token, role, username: dbUsername } = response.data;

            localStorage.setItem('token', token);
            const userDataStored = { username: dbUsername, role };
            localStorage.setItem('user', JSON.stringify(userDataStored));

            setUser(userDataStored);
            return response.data;
        } catch (error) {
            console.error('Registration failed', error);
            throw error;
        }
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
