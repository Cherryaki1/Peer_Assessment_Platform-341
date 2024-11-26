import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../_InstructorSidebar';
import { useNavigate } from 'react-router-dom';

const InstructorDashboard = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
    const navigate = useNavigate();  // React Router hook for navigation

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost:3000/index', {
                    withCredentials: true
                });
                setUser(response.data.user);
                setMessage(response.data.message);
            } catch (error) {
                setMessage(error.response?.data?.message || 'Failed to fetch user');
            } finally {
                setLoading(false);
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
                    setMessage('');
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
                setMessage(`Error: ${error.response?.data?.message || 'Failed to fetch classes.'}`);
            }
        };

        fetchUser();
        fetchClasses();  
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);

        return () => clearInterval(timer); 

    }, []);

    const handleSummaryClick = (classID) => {
        console.log('Navigating to classID:', classID);
        if (parseInt(classID)) {
            console.log("Navigating",classID);
            navigate(`/studentsSummaryPage/${classID}`);
        } else {
            console.error('No classID found!');
        }
    };

    if (loading) {
        return <div className="loading-indicator">Loading...</div>; // Consider adding a spinner or loading animation
    }

    return (
        <div className="dashboard-container" style={{ display: 'flex' }}>
            <Sidebar />
            <div className="content" style={{ padding: '20px', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column',}}>
                {user ? (
                    <div>
                        <h2>{message}</h2>
                        <h2
                            style={{
                                    fontSize: '2em',
                                    fontWeight: 'bold', // Bold and prominent greeting
                            }}
                        >
                            Welcome Instructor, {user.FirstName}!
                        </h2>
                        <h3>{currentTime}</h3> {/* Displays the current time */}

                        <div>
                            <h3>Current Classes</h3>
                            {classes.length > 0 ? (
                                <ul>
                                    {classes.map((classItem, index) => (
                                        <li key={index}>
                                            <strong>{classItem.name}</strong> ({classItem.subject}, Section: {classItem.section})<br />
                                            <span>{classItem.studentCount} Students, {classItem.groupCount} Groups</span>
                                            <br />
                                            <button
                                                onClick={() => handleSummaryClick(classItem.id)}
                                                style={{
                                                    marginTop: '10px',
                                                    padding: '10px 15px',
                                                    backgroundColor: '#007bff',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Summary View
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>{message || 'No classes available.'}</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p>{message}</p>
                )}
            </div>
        </div>
    );
};

export default InstructorDashboard;
