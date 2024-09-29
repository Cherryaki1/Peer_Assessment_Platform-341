// src/app/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './app/Login';
import UserDashboard from './app/UserDashboard';
import AdminDashboard from './app/AdminDashboard';
import './index.css';


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/userDashboard" element={<UserDashboard />} />
                <Route path="/adminDashboard" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
};

export default App;
