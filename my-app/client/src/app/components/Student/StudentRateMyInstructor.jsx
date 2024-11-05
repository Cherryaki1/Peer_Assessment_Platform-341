import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentSidebar from '../_StudentSidebar'; 
import { useNavigate } from 'react-router-dom';

const StudentRateMyInstructor = () => {
    const [classes, setClasses] = useState([]);
    const [message, setMessage] = useState('');
    const [studentID, setStudentID] = useState(null);
    const [ratedInstructors, setRatedInstructors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    // Run fetchClasses only once studentID is set
    useEffect(() => {
        if (studentID) {
            fetchClasses();
        }
    }, [studentID]);

    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://localhost:3000/index', { withCredentials: true });
            if (response.data.user && response.data.user.ID) {
                setStudentID(response.data.user.ID);
            } else {
                setMessage('Failed to retrieve student data.');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setMessage('Error fetching user data.');
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axios.get('http://localhost:3000/studentManageClasses', { withCredentials: true });
            const classes = response.data.classes;
            setClasses(classes);

            if (classes.length === 0) {
                setMessage('No classes are available (None added).');
            } else {
                checkRatedInstructors(classes);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            setMessage('Failed to fetch classes.');
        }
    };

    const checkRatedInstructors = async (classList) => {
        const ratedStatus = {};

        await Promise.all(
            classList.map(async (classItem) => {
                try {
                    const response = await axios.get('http://localhost:3000/hasRatedInstructor', {
                        params: {
                            studentID,
                            instructorID: classItem.instructorID,
                            classID: classItem.id,
                        },
                        withCredentials: true,
                    });
                    ratedStatus[classItem.id] = response.data.hasRated;
                } catch (error) {
                    console.error('Error checking instructor rating status:', error);
                }
            })
        );

        // Update state once all rated statuses are fetched
        setRatedInstructors(ratedStatus);
    };

    const handleRateInstructor = (instructorID, classItem) => {
        if (instructorID) {
            navigate(`/studentRateMyInstructor/${instructorID}`, { state: { classInfo: classItem } });
        } else {
            console.error('No instructorID found!');
        }
    };

    return (
        <div className="manage-classes-container" style={{ display: 'flex' }}>
            <StudentSidebar />
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <h2>My Instructors</h2>
                <div>
                    <h3>Current Classes and Instructors</h3>
                    {classes.length > 0 ? (
                        <ul>
                            {classes.map((classItem, index) => (
                                <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <strong>{classItem.name}</strong> ({classItem.subject}, Section: {classItem.section}) - Instructor: {classItem.instructorName}
                                    </div>
                                    {ratedInstructors[classItem.id] ? (
                                        <span style={{ marginLeft: '10px', color: 'green' }}>Rated ✔</span>
                                    ) : (
                                        <button 
                                            onClick={() => handleRateInstructor(classItem.instructorID, classItem)}
                                            style={{ marginLeft: '10px', cursor: 'pointer' }}
                                        >
                                            Rate My Instructor
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{message}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentRateMyInstructor;
