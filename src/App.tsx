import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Companies from './pages/Companies';
import Categories from './pages/Categories';
import Offers from './pages/Offers';
import Users from './pages/Users';
import Login from './pages/Login';
import './assets/styles/global.css';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <MainLayout navbar={<Navbar />}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </MainLayout>
        </BrowserRouter>
    );
};

export default App;