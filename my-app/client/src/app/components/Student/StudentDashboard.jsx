import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentSidebar from '../_StudentSidebar';
import Calendar from 'react-calendar';
import Reminder from '../Reminder'; // Import the Reminder component
import 'react-calendar/dist/Calendar.css';

const StudentDashboard = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const [groupDetails, setGroupDetails] = useState([]);

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
                console.log('Error message:', errorMsg);
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

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const calculateDaysLeft = (deadline) => {
        if (!deadline) return null;
        const deadlineDate = new Date(deadline);
        const today = new Date();
        return Math.ceil((deadlineDate - today) / (1000 * 3600 * 24));
    };

    return (
        <div className="dashboard-container" style={{ display: 'flex', height: '100vh' }}>
            <StudentSidebar />
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                {user && (
                    <div>
                        <h2 style={{ textAlign: 'center', fontSize: '2em', fontWeight: 'bold' }}>
                            Welcome {user.FirstName} {user.LastName}!
                        </h2>
                        <h3 style={{ textAlign: 'center' }}>{currentTime}</h3>
                    </div>
                )}
                <div>
                    {groupDetails.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {groupDetails.map((group, index) => {
                                const daysLeft = calculateDaysLeft(group.submissionDeadline);
                                return (
                                    <div
                                        key={index}
                                        className="bg-gray-200 rounded-md p-4 shadow-md transition-transform transform"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            width: '100%',
                                        }}
                                    >
                                        <h3 className="text-xl font-bold">{group.groupName}</h3>
                                        <p>
                                            <strong>Class:</strong> {group.className} - {group.classSubject} - Section{' '}
                                            {group.classSection}
                                        </p>
                                        <p>
                                            <strong>Submission Deadline:</strong>{' '}
                                            {group.submissionDeadline
                                                ? new Date(group.submissionDeadline).toLocaleDateString()
                                                : 'No deadline set'}
                                        </p>
                                        {daysLeft !== null && (
                                            <p>
                                                <strong>Days Left:</strong> {daysLeft > 0 ? daysLeft : 'Deadline passed'}
                                            </p>
                                        )}
                                        {group.classID && <Reminder classID={group.classID} />}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', marginTop: '20px' }}>
                            No groups or deadlines found for this student.
                        </p>
                    )}
                </div>
                <div
                    style={{
                        marginTop: '20px',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <Calendar />
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
