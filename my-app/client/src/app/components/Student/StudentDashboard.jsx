import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentSidebar from '../_StudentSidebar';

const StudentDashboard = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/index', {
                    withCredentials: true
                });
                setUser(response.data.user);
                setMessage(response.data.message);
            } catch (error) {
                const errorMsg = error.response?.data?.message || 'Failed to fetch user';
                console.log('Error message:', errorMsg); // Log the error message
                setMessage(errorMsg);
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

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="dashboard-container" style={{ display: 'flex' }}>
            <StudentSidebar /> {/* Include Sidebar component */}
            <div className="content" style={{ padding: '20px', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                {loading ? (
                    <p data-testid="loading-message">Loading...</p> // Render a loading message when loading is true
                ) : user ? (
                    <div style={{ textAlign: 'center' }} data-testid="welcome-message">
                        <h2 style={{ fontSize: '2em', fontWeight: 'bold' }} data-testid="user-name">
                            Welcome {user.FirstName} {user.LastName}!
                        </h2>
                        <h3 data-testid="current-time">{currentTime}</h3>
                    </div>
                ) : (
                    <p data-testid="error-message">{message}</p>
                )}
            </div>
        </div>
    );    
};

export default StudentDashboard;