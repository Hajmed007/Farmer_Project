import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import Navbar from './Navbar';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import FarmerDashboard from './FarmerDashboard';
import Cart from './Cart';
import MyOrders from './MyOrders';
import Checkout from './Checkout';
import AdminDashboard from './AdminDashboard';
import Verification from './Verification';
import EmailVerification from './EmailVerification';
import BankDetails from './BankDetails';
import Profile from './Profile';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <CartProvider> {/* Wrapped Router with CartProvider */}
                <Router>
                    <div className="app-wrapper">
                        <Navbar />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/verify" element={<Verification />} />
                                <Route path="/verify-email" element={<EmailVerification />} />
                                {/* Updated dashboard routes */}
                                <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/my-orders" element={<MyOrders />} />
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/admin" element={<AdminDashboard />} />
                                <Route path="/bank-details" element={<BankDetails />} />
                                <Route path="/profile" element={<Profile />} />
                            </Routes>
                        </main>
                    </div>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
