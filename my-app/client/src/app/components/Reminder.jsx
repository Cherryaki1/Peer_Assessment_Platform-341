// Instructor/Reminder.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reminder = ({ classID }) => {
    const [submissionDeadline, setSubmissionDeadline] = useState(null);
    const [daysLeft, setDaysLeft] = useState(null);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        // Fetch the class deadline from the backend
        const fetchDeadline = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/classDeadline/${classID}`, {
                    withCredentials: true,
                });
                const deadline = new Date(response.data.submissionDeadline);
                setSubmissionDeadline(deadline);
                
                // Calculate how many days are left until the deadline
                const today = new Date();
                const timeDiff = deadline - today; // In milliseconds
                const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert to days
                setDaysLeft(daysRemaining);
            } catch (error) {
                console.error('Error fetching deadline:', error);
            }
        };
        
        if (classID) {
            fetchDeadline();
        }
    }, [classID]);
    if (error) {
        return (
            <div
                className="reminder-box"
                style={{
                    backgroundColor: '#ffe6e6',
                    border: '1px solid #ff0000',
                    padding: '10px',
                    borderRadius: '5px',
                    color: '#ff0000',
                }}
            >
                <h3 style={{ margin: 0 }}>REMINDER!</h3>
                <p>{error}</p>
            </div>
        );
    }

    if (!submissionDeadline) {
        return (
            <div
                className="reminder-box"
                style={{
                    backgroundColor: '#ffe6e6',
                    border: '1px solid #ff0000',
                    padding: '10px',
                    borderRadius: '5px',
                    color: '#ff0000',
                }}
            >
                <h3 style={{ margin: 0 }}>REMINDER!</h3>
                <p>Loading reminder...</p>
            </div>
        );
    }

    return (
        <div
            className="reminder-box"
            style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                backgroundColor: '#ffe6e6',
                border: '1px solid #ff0000',
                color: '#ff0000',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                maxWidth: '300px',
                fontFamily: 'Arial, sans-serif',
            }}
        >
            <h3 style={{ margin: 0, fontSize: '1.4em', fontWeight: 'bold' }}>REMINDER!</h3>
            {daysLeft >= 0 ? (
                <p>You have {daysLeft} day{daysLeft !== 1 ? 's' : ''} to submit your peer assessment.</p>
            ) : (
                <p>The submission deadline has passed.</p>
            )}
        </div>
    );
};

export default Reminder;