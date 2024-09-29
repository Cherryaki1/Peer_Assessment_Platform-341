// src/app/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import InstructorDashboard from './components/InstructorDashboard';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/studentDashboard" element={<StudentDashboard />} />
                <Route path="/instructorDashboard" element={<InstructorDashboard />} />
            </Routes>
        </Router>
    );
};

export default App;
