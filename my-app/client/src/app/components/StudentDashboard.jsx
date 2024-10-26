// client/src/app/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentSidebar from './StudentSidebar';

const StudentDashboard = () => {
    const [user, setUser] = useState(null);
    const [studentID, setStudentID] = useState(null); //store student ID
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/index', {
                    withCredentials: true
                });
                setUser(response.data.user);
                setMessage(response.data.message);

                if (response.data.user && response.data.user.ID) {
                    const userID = response.data.user.ID;
                    setStudentID(userID); // Store the student's ID
                    await fetchStudentFromUser(userID);
                } else {
                    setMessage('Failed to retrieve students data.');
                }
            } catch (error) {
                setMessage(error.response?.data?.message || 'Failed to fetch user');
            } finally {
                setLoading(false); // Always stop loading regardless of success/failure
            }
        };

        const fetchStudentFromUser = async (userID) => {
            try {
                const response = await axios.get('http://localhost:3000/studentFromUser', {
                    withCredentials: true,
                });
    
                if (response.data.student && response.data.student.Groups) {
                    //setStudentData(response.data.student); // Store the student's data, including groupID
                    console.log("Setting groupID:", response.data.student.Groups);
                } else {
                    setMessage('Student not found or no group data available.');
                }
            } catch (error) {
                console.error('Error fetching student from user:', error);
                setMessage('Error fetching student data.');
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard-container" style={{ display: 'flex' }}>
            <StudentSidebar /> {/* Include Sidebar component */}
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                {user ? (
                    <div>
                        <h2>{message}</h2>
                        <h2>Welcome {user.FirstName} {user.LastName}!</h2>
                    </div>
                ) : (
                    <p>{message}</p>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
