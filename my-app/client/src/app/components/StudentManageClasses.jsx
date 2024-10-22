import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // To get classID from the URL
import StudentSidebar from './StudentSidebar'; 
import Sidebar from './Sidebar';

const StudentManageClasses = () =>{
    const navigate = useNavigate();  // React Router hook for navigation
    const [classes, setClasses] = useState([]);
    const [message, setMessage] = useState('');
    const [studentID, setStudentID] = useState(null); // Store student's ID

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch the logged-in user data (instructor)
                const response = await axios.get('http://localhost:3000/index', {
                    withCredentials: true,
                });
                
                if (response.data.user && response.data.user.ID) {
                    setStudentID(response.data.user.ID); // Store the instructor's ID
                } else {
                    setMessage('Failed to retrieve instructor data.');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setMessage('Error fetching user data.');
            }
        };
        const fetchClasses = async () => {
            try {
                const response = await axios.get('http://localhost:3000/instructorManageClasses', {
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

    return(
        <div className="manage-classes-container" style={{ display: 'flex' }}>
            <Sidebar /> {/* Include Student's Sidebar component */}
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <h2>My Classes</h2>
                </div>
        </div>
    );


}

export default StudentManageClasses;


