// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import './components/styles.css';
import InstructorDashboard from './components/Instructor/InstructorDashboard';
import InstructorManageClasses from './components/Instructor/InstructorManageClasses'; //can take off?
//import GroupManagement from './components/groupManagement'; 
import InstructorManageGroups from './components/Instructor/InstructorManageGroups';
import StudentDashboard from './components/Student/StudentDashboard';
import StudentManageClasses from './components/Student/StudentManageClasses';
import StudentManageGroups from './components/Student/StudentManageGroups';
import StudentGrades from './components/Student/StudentReviewRatings';
import StudentRatePage from './components/Student/RatingStudent/StudentRatePage';
import ConfirmStudentRating from './components/Student/RatingStudent/ConfirmStudentRating';
import StudentRateMyInstructor from './components/Student/StudentRateMyInstructor';
import InstructorRatePage from './components/Student/RatingInstructor/InstructorRatePage';
import ConfirmInstructorRating from './components/Student/RatingInstructor/ConfirmInstructorRating';




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

                <Route path="/instructorDashboard" element={<InstructorDashboard />} />
                <Route path="/instructorManageClasses" element={<InstructorManageClasses />} /> 
                <Route path="/instructorManageGroups/:classID" element={<InstructorManageGroups />} />

                <Route path="/studentDashboard" element={<StudentDashboard />} />
                <Route path="/studentManageClasses" element={<StudentManageClasses />} />
                <Route path="/studentManageGroups/:classID" element={<StudentManageGroups />} />
                <Route path="/studentRatePage" element={<StudentRatePage ratings={ratingList} />} />

                <Route path="/studentReviewRatings" element={<StudentGrades />} />
                <Route path="/confirmStudentRating" element={<ConfirmStudentRating />} />
                  
                <Route path="/studentRateMyInstructor" element={<StudentRateMyInstructor />} />
                <Route path="/studentRateMyInstructor/:instructorID" element={<InstructorRatePage />} />
                <Route path="/confirmInstructorRating" element={<ConfirmInstructorRating />} />

            </Routes>
        </Router>
    );
};

export default App;
