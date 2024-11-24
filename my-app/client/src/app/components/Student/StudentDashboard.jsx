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
                    console.log("Setting groupID:", response.data.student.Groups);
                } else {
                    setMessage('Student not found or no group data available.');
                }
            } catch (error) {
                console.error('Error fetching student from user:', error);
                setMessage('Error fetching student data.');
            }
        };

        const fetchClassDeadline = async () => {
            if (groupID) {
                try {
                    const response = await axios.get(`http://localhost:3000/classDeadline/${groupID}`);
                    setSubmissionDeadline(response.data.submissionDeadline);
                } catch (error) {
                    console.error('Error fetching submission deadline:', error);
                }
            }
        };

        fetchUserData();
        fetchStudentFromUser();
        fetchClassDeadline();


        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

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
                            {submissionDeadline ? (
                                 <div
                                 style={{
                                     padding: '20px',
                                     border: '1px solid #ccc',
                                     borderRadius: '5px',
                                     backgroundColor: '#f9f9f9',
                                     color: 'red',
                                     fontWeight: 'bold',
                                     marginTop: '10px',
                                 }}
                             >
                                 <h4>Submission Deadline</h4>
                                 <p>
                                     The deadline is{' '}
                                     {new Date(submissionDeadline).toLocaleDateString()}. Make sure to
                                     submit your peer assessments before the deadline!
                                 </p>
                             </div>
                         ) : (
                             <p>No submission deadline set for your group.</p>
                         )}
                     </div>
                 ) : (
                        <p>You are not assigned to any group yet.</p> /* Message when student has no group */
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