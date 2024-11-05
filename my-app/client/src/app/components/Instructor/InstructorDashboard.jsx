// client/src/app/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../_InstructorSidebar';
import { useNavigate } from 'react-router-dom';


const InstructorDashboard = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState([]);
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
                setLoading(false); // Always stop loading regardless of success/failure
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

        fetchUser();
        fetchClasses();  // Fetch the list of classes
    }, []);

    // Function to handle clicking on "Summary View"
    const handleSummaryClick = (classID) => {
        console.log('Navigating to classID:', classID);  // Debug to see if classID exists
        if (classID) {
            navigate(`/SummaryView/${classID}`);
        } else {
            console.error('No classID found!');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard-container" style={{ display: 'flex' }}>
            <Sidebar /> {/* Include Sidebar component */}
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                {user ? (
                    <div>
                        <h2>{message}</h2>
                        <h2>Welcome Instructor, {user.FirstName}!</h2>
                        {/* Display current classes */}
                        <div>
                            <h3>Current Classes</h3>
                            {classes.length > 0 ? (
                                <ul>
                                    {classes.map((classItem, index) => (
                                        <li key={index}>
                                                <strong>{classItem.name}</strong> ({classItem.subject}, Section: {classItem.section}) - {classItem.studentCount} Students, {classItem.groupCount} Groups
                                                <br/>
                                                <button onClick={handleSummaryClick}>Summary View</button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>{message}</p> // Display the message if there are no classes
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
