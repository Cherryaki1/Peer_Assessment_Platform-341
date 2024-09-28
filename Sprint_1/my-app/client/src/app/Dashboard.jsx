// client/src/app/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
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
        <div>
            {user ? (
                <div>
                    <h2>{message}</h2>
                    <p>Welcome, {user.FirstName}!</p>
                </div>
            ) : (
                <p>{message}</p>
            )}
        </div>
    );
};

export default Dashboard;
