// src/app/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './components/styles.css';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import InstructorDashboard from './components/InstructorDashboard';
import InstructorManageClasses from './components/InstructorManageClasses'; //can take off?
import GroupManagement from './components/groupManagement'; 


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/studentDashboard" element={<StudentDashboard />} />
                <Route path="/instructorDashboard" element={<InstructorDashboard />} />
                <Route path="/instructorManageClasses" element={<InstructorManageClasses />} />  
                <Route path="/groupManagement" element={<GroupManagement />} /> 
                
            </Routes>
        </Router>
    );
};

export default App;
