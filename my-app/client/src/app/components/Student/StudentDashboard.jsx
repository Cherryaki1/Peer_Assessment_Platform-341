import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentSidebar from '../_StudentSidebar';
import Reminder from 'Reminder';

    const StudentDashboard = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [groupID, setGroupID] = useState(null);
    const [submissionDeadline, setSubmissionDeadline] = useState(null);
    const [daysUntilDeadline, setDaysUntilDeadline] = useState(null);


    }

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

          // Update time every second
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Fetch submission deadline for the assigned class
        const fetchClassDeadline = async () => {
            if (classID) {
                try {
                    const response = await axios.get(`http://localhost:3000/classDeadline/${classID}`);
                    setSubmissionDeadline(response.data.submissionDeadline);
                } catch (error) {
                    console.error('Error fetching submission deadline:', error);
                }
            }
        };

        fetchClassDeadline();
    }, [classID]);

    const calculateDaysLeft = () => {
        if (!submissionDeadline) return null;
        const deadlineDate = new Date(submissionDeadline);
        const today = new Date();
        return Math.ceil((deadlineDate - today) / (1000 * 3600 * 24)); // Calculate days left
    };

    const daysLeft = calculateDaysLeft();


        return () => clearInterval(interval); // Cleanup interval on unmount

    return (
        <div className="dashboard-container" style={{ display: 'flex' }}>
            <StudentSidebar /> {/* Include Sidebar component */}
            <div className="content" style={{ padding: '20px', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                {user ? (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2em', fontWeight: 'bold' }}>Welcome {user.FirstName} {user.LastName}!</h2>
                        <h3>{currentTime}</h3>
                    {groupID ? (
                        <div>
                            <h3>Group ID: {groupID}</h3> {/* Display the student group */}

                            {/*Reminder Notification*/}
                            {submissionDeadline ? (
                                 <div
                                 style={{
                                    top: '20px',
                                    right: '20px',
                                    backgroundColor: '#ffe6e6', // Light red background
                                    border: '1px solid #ff0000', // Red border
                                    color: '#ff0000', // Red text
                                    padding: '10px',
                                    borderRadius: '5px',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                    maxWidth: '300px',
                                 }}
                             >
                                         <h4
                                    style={{
                                        margin: 0,
                                        fontSize: '1.5em',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    REMINDER!
                                </h4>
                                <p style={{ margin: '5px 0' }}>
                                {daysLeft > 0
                                ? `You have ${daysLeft} day${daysLeft !== 1 ? 's' : ''} to submit your peer assessment before the deadline.`
                                : 'The submission deadline has passed!'}
                                 </p>
                             </div>
                         ) : (
                             <p>No submission deadline set for your group.</p>
                         )}
                     </div>
                 ) : (
                        <p>No submission deadline set for this class.</p> 
                    )}
                    {message && <p>{message}</p>} {/* Show message if available */}
                </div>
            ) : (
                <p>{message}</p> /* Show message if user data is unavailable */
            )}
        </div>
    </div>
);

export default StudentDashboard;