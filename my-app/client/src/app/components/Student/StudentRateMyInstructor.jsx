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
        const ratedInstructorID = {};

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
                    ratedInstructorID[classItem.id] = response.data[classItem.id] || [];
                } catch (error) {
                    console.error('Error checking instructor rating status:', error);
                }
            })
        );

        // Update state once all rated statuses are fetched
        setRatedInstructors(ratedInstructorID);
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
                <div className="
                    w-full 
                    bg-emerald-500 
                    text-white 
                    py-10 
                    text-center 
                    rounded-md 
                    mb-4">
                    <h2 className="
                        text-3xl 
                        font-bold
                        ">Rate My Instructor</h2>
                </div>
                <div>
                    {classes.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4">
                            {classes.map((classItem, index) => (
                                <div key={index} className="p-4 border rounded-md bg-gray-200">
                                    <h3 className="text-xl font-bold mb-2">{classItem.instructorName}</h3>
                                    <p>{classItem.name} ({classItem.subject}, Section: {classItem.section})</p>
                                    {ratedInstructors[classItem.id] === classItem.instructorID ? (
                                        <span className="text-green-600">Rated ✔</span>
                                    ) : (
                                        <button 
                                            onClick={() => handleRateInstructor(classItem.instructorID, classItem)}
                                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-300"
                                        >
                                            Rate My Instructor
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>{message}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentRateMyInstructor;