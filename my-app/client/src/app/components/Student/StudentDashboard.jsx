import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentSidebar from '../_StudentSidebar';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import calendar styles

const StudentDashboard = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [groupDetails, setGroupDetails] = useState([]); // Stores group and deadline details

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/index', { withCredentials: true });
                setUser(response.data.user);
                setMessage(response.data.message);

                if (response.data.user && response.data.user.ID) {
                    fetchStudentDeadlines(response.data.user.ID);
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || 'Failed to fetch user';
                console.log('Error message:', errorMsg); // Log the error message
                setMessage(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        const fetchStudentDeadlines = async (studentID) => {
            try {
                const response = await axios.get('http://localhost:3000/studentDeadlines', {
                    params: { studentID },
                });

                console.log('Response from /studentDeadlines:', response.data);

                if (response.data.groups) {
                    console.log('Student Groups:', response.data.groups);
                    setGroupDetails(response.data.groups);
                } else {
                    console.error('No groups found for the student.');
                }
            } catch (error) {
                console.error('Error fetching student groups:', error);
                setMessage('Error fetching student groups.');
            }
        };

        fetchUserData();

        // Update time every second
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer); // Cleanup interval on unmount
    }, []);

    const calculateDaysLeft = (deadline) => {
        if (!deadline) return null;
        const deadlineDate = new Date(deadline);
        const today = new Date();
        return Math.ceil((deadlineDate - today) / (1000 * 3600 * 24)); // Calculate days left
    };

    const handleCalendarTileContent = ({ date }) => {
        const formattedDate = date.toISOString().split('T')[0];
        const matchingGroups = groupDetails.filter(
            (group) => group.submissionDeadline && new Date(group.submissionDeadline).toISOString().split('T')[0] === formattedDate
        );

        if (matchingGroups.length > 0) {
            return (
                <div style={{ textAlign: 'center' }}>
                    {matchingGroups.map((group, index) => (
                        <div
                            key={index}
                            style={{
                                backgroundColor: '#ffcc00',
                                color: 'black',
                                fontSize: '0.75em',
                                padding: '2px',
                                borderRadius: '5px',
                                marginTop: '2px',
                            }}
                        >
                            {group.groupName}
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="dashboard-container" style={{ display: 'flex', height: '100vh' }}>
            <StudentSidebar /> {/* Include Sidebar component */}
            <div
                className="content"
                style={{
                    padding: '20px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center', // Centers vertically
                }}
            >
                {user ? (
                    <div style={{ width: '100%' }}>
                        <h2 style={{ textAlign: 'center', fontSize: '2em', fontWeight: 'bold' }}>
                            Welcome {user.FirstName} {user.LastName}!
                        </h2>
                        <h3 style={{ textAlign: 'center' }}>{currentTime}</h3>
                        <div>
                            {groupDetails.length > 0 ? (
                                groupDetails.map((group, index) => {
                                    const daysLeft = calculateDaysLeft(group.submissionDeadline);
                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center', // Centers text horizontally
                                                border: '1px solid #ccc',
                                                padding: '20px',
                                                margin: '15px 0',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                                width: '100%',
                                                textAlign: 'center', // Centers text alignment
                                            }}
                                        >
                                            <h3>
                                                <strong>Group:</strong> {group.groupName}
                                            </h3>
                                            <p>
                                                <strong>Class:</strong> {group.className} - {group.classSubject} - Section {group.classSection}
                                            </p>
                                            <p>
                                                <strong>Submission Deadline:</strong>{' '}
                                                {group.submissionDeadline
                                                    ? new Date(group.submissionDeadline).toISOString().split('T')[0]
                                                    : 'No deadline set'}
                                            </p>
                                            {daysLeft !== null && (
                                                <p>
                                                    {daysLeft > 0
                                                        ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left until the deadline.`
                                                        : 'The submission deadline has passed!'}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{ textAlign: 'center' }}>No groups or deadlines found for this student.</p>
                            )}
                        </div>
                        {message && <p style={{ textAlign: 'center' }}>{message}</p>} {/* Show message if available */}

                        {/* Calendar Section */}
                        <div
                            style={{
                                marginTop: '20px',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <Calendar
                                tileContent={handleCalendarTileContent}
                                style={{
                                    width: '100%', // Makes the calendar span the content div horizontally
                                    maxWidth: '100%',
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <p style={{ textAlign: 'center' }}>{message}</p> /* Show message if user data is unavailable */
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
