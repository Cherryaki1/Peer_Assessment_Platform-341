// src/app/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './components/styles.css';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import InstructorDashboard from './components/InstructorDashboard';
import InstructorManageClasses from './components/InstructorManageClasses'; //can take off?
//import GroupManagement from './components/groupManagement'; 
import InstructorManageGroups from './components/InstructorManageGroups';
import StudentManageClasses from './components/StudentManageClasses';
import StudentManageGroups from './components/StudentManageGroups';
import Rate from './components/StudentRatePage';

const ratingList = [
    { id: 1, title: 'Collaboration' },
    { id: 2, title: 'Communication' },
    { id: 3, title: 'Problem Solving' },
    { id: 4, title: 'Punctuality' },
    { id: 5, title: 'Quality of Work' },
];

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/studentDashboard" element={<StudentDashboard />} />
                <Route path="/instructorDashboard" element={<InstructorDashboard />} />
                <Route path="/instructorManageClasses" element={<InstructorManageClasses />} /> 
                <Route path="/instructorManageGroups/:classID" element={<InstructorManageGroups />} />
                <Route path="/studentManageClasses" element={<StudentManageClasses />} />
                <Route path="/studentManageGroups/:classID" element={<StudentManageGroups />}/>
                <Route path="/rate" element={<Rate ratings={ratingList} />}/> 
            </Routes>
        </Router>
    );
};

export default App;
