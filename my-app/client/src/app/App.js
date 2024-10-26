// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import StudentManageClasses from './components/StudentManageClasses';
import StudentManageGroups from './components/StudentManageGroups';
import StudentRatePage from './components/StudentRatePage';
import ConfirmRatingPage from './components/ConfirmRatingPage';

const ratingList = [
    { id: 'Cooperation', title: 'Cooperation' },
    { id: 'Communication', title: 'Communication' },
    { id: 'ProblemSolving', title: 'Problem Solving' },
    { id: 'Punctuality', title: 'Punctuality' },
];

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/studentDashboard" element={<StudentDashboard />} />
                <Route path="/studentManageClasses" element={<StudentManageClasses />} />
                <Route path="/studentManageGroups/:classID" element={<StudentManageGroups />} />
                <Route path="/studentRatePage" element={<StudentRatePage ratings={ratingList} />} />
                <Route path="/confirm-rating" element={<ConfirmRatingPage />} />
            </Routes>
        </Router>
    );
};

export default App;
