// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import './components/styles.css';
import InstructorDashboard from './components/Instructor/InstructorDashboard';
import InstructorManageClasses from './components/Instructor/InstructorManageClasses'; // Can remove if not used
import InstructorManageGroups from './components/Instructor/InstructorManageGroups';
import StudentDashboard from './components/Student/StudentDashboard';
import StudentManageClasses from './components/Student/StudentManageClasses';
import StudentManageGroups from './components/Student/StudentManageGroups';
import StudentRatePage from './components/Student/Rating/StudentRatePage';
import ConfirmRatingPage from './components/Student/Rating/ConfirmRatingPage';
import SummaryView from './components/Instructor/SummaryViewPage';

const ratingList = [
    { id: 'Cooperation', title: 'Cooperation' },
    { id: 'Conceptual Contribution', title: 'Conceptual Contribution' },
    { id: 'Practical Contribution', title: 'Practical Contribution' },
    { id: 'Work Ethic', title: 'Work Ethic' },
];

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/studentDashboard" element={<StudentDashboard />} />
                <Route path="/studentManageClasses" element={<StudentManageClasses />} />
                <Route path="/instructorDashboard" element={<InstructorDashboard />} />
                <Route path="/instructorManageClasses" element={<InstructorManageClasses />} /> 
                <Route path="/instructorManageGroups/:classID" element={<InstructorManageGroups />} />
                <Route path="/studentManageGroups/:classID" element={<StudentManageGroups />} />
                <Route path="/studentRatePage" element={<StudentRatePage ratings={ratingList} />} />
                <Route path="/confirm-rating" element={<ConfirmRatingPage />} />
                <Route path="/studentsSummary/:classID" element={<SummaryView />} />
            </Routes>
        </Router>
    );
};

export default App;
