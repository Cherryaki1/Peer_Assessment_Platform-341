import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import { useParams } from 'react-router-dom'; // To get classID from the URL
import StudentSidebar from '../_StudentSidebar'; 
import { useNavigate } from 'react-router-dom';

const StudentManageClasses = () =>{
    const [classes, setClasses] = useState([]);
    const [message, setMessage] = useState('');
    const [studentID, setStudentID] = useState(null); // Store student's ID
    const navigate = useNavigate();  // React Router hook for navigation

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch the logged-in user data 
                const response = await axios.get('http://localhost:3000/index', {
                    withCredentials: true,
                });
                
                if (response.data.user && response.data.user.ID) {
                    setStudentID(response.data.user.ID); // Store the students's ID
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

        fetchUserData(); // Fetch the student's information
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

    return(
        <div className="manage-classes-container" style={{ display: 'flex' }}>
            <StudentSidebar /> {/* Include Student's Sidebar component */}
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <h2>My Classes</h2>
                <div>
                    <h3>Current Classes</h3>
                    {classes.length > 0 ? (
                        <ul>
                            {classes.map((classItem, index) => (
                                <li key={index}>
                                     <button onClick={() => handleClassClick(classItem.id)} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
                                        <strong>{classItem.name}</strong> ({classItem.subject}, Section: {classItem.section}) - {classItem.studentCount} Students, {classItem.groupCount} Groups
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{message}</p> // Display the message if there are no classes
                    )}
                </div>
            </div>
        </div>
    );


}

export default StudentManageClasses;


