import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentSidebar from '../_StudentSidebar';
import { useNavigate } from 'react-router-dom';

const StudentManageClasses = () => {
    const [classes, setClasses] = useState([]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await axios.get('http://localhost:3000/studentManageClasses', {
                    withCredentials: true,
                });
                setClasses(response.data.classes);
                if (response.data.classes.length === 0) {
                    setMessage('No classes are available (None added).');
                } else {
                    setMessage(''); // Clear the message if there are classes
                }
            } catch (error) {
                console.error('Error fetching classes:', error);

                if (error.response) {
                    setMessage(`Error: ${error.response.data.message || 'Failed to fetch classes.'}`);
                } else if (error.request) {
                    setMessage('No response from server. Check if the server is running.');
                } else {
                    setMessage('Error setting up the request.');
                }
            }
        };

        fetchClasses();  // Fetch the list of classes
    }, []);

    const handleClassClick = (classID) => {
        console.log('Navigating to classID:', classID);  // Debug to see if classID exists
        if (classID) {
            navigate(`/studentManageGroups/${classID}`);
        } else {
            console.error('No classID found!');
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
                    rounded-md"
                    >
                    <h2 className="
                        text-3xl 
                        font-bold"
                    >My Classes</h2>
                </div>
                <div>
                    {classes.length > 0 ? (
                        <div className="
                        grid 
                        grid-cols-3 
                        gap-4 
                        mt-4">
                            {classes.map((classItem, index) => (
                                <div 
                                    key={index} 
                                    className="
                                    p-4 
                                    bg-gray-200 
                                    rounded-md 
                                    cursor-pointer 
                                    hover:bg-gray-300 
                                    transition-colors 
                                    duration-300"
                                    onClick={() => handleClassClick(classItem.id)}
                                >
                                    <h3 className="text-xl font-bold">{classItem.name}</h3>
                                    <p>{classItem.subject}, Section: {classItem.section}</p>
                                    <p>{classItem.studentCount} Students</p>
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
}

export default StudentManageClasses;