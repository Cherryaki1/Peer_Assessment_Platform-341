// Instructor/Reminder.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reminder = ({ classID }) => {
    const [submissionDeadline, setSubmissionDeadline] = useState(null);
    const [daysLeft, setDaysLeft] = useState(null);
    
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
        return <div style={{ color: 'red', fontWeight: 'bold' }}>Error fetching deadline.</div>;
    }
    if (!submissionDeadline) {
        return <div>Loading reminder...</div>;
    }

    return (
        <div className="reminder">
            <h2>Peer Assessment Deadline Reminder</h2>
            {daysLeft >= 0 ? (
                <p>You have {daysLeft} day{daysLeft !== 1 ? 's' : ''} left to submit your peer assessments.</p>
            ) : (
                <p>The peer assessment deadline has passed.</p>
            )}
        </div>
    );
};

export default Reminder;
