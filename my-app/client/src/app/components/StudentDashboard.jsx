// client/src/app/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentSidebar from './StudentSidebar';

const StudentDashboard = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

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

        fetchUser();
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
