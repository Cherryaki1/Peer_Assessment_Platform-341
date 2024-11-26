import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reminder = ({ classID }) => {
    const [submissionDeadline, setSubmissionDeadline] = useState(null);
    const [daysLeft, setDaysLeft] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("classID in Reminder:", classID);

        const fetchDeadline = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/classDeadline/${classID}`, {
                    withCredentials: true,
                });

                if (response.data.submissionDeadline) {
                    const deadline = new Date(response.data.submissionDeadline);
                    setSubmissionDeadline(deadline);

                    const today = new Date();
                    const timeDiff = deadline - today;
                    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    setDaysLeft(daysRemaining);
                } else {
                    setError('Submission deadline not found.');
                }
            } catch (error) {
                console.error('Error fetching deadline:', error);
                setError('Failed to fetch deadline.');
            }
        };

        if (classID) {
            fetchDeadline();
        }
    }, [classID]);

    if (!submissionDeadline) {
        return <div>Loading reminder...</div>;
    }

    // Determine colors dynamically based on the days left
    const getReminderStyle = () => {
        if (daysLeft === null) {
            return {};
        } else if (daysLeft <= 0) {
            // Red for deadline passed
            return {
                backgroundColor: '#ffe6e6',
                border: '1px solid #ff0000',
                color: '#ff0000',
            };
        } else if (daysLeft <= 3) {
            // Yellow for 1-3 days left
            return {
                backgroundColor: '#fff8cc',
                border: '1px solid #ffcc00',
                color: '#a67c00',
            };
        } else {
            // Green for 4+ days left
            return {
                backgroundColor: '#e6ffed',
                border: '1px solid #2d572c',
                color: '#2d572c',
            };
        }
    };

    const reminderStyle = getReminderStyle();

    return (
        <div
            style={{
                ...reminderStyle,
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                marginTop: '10px',
            }}
        >
            <h3>REMINDER!</h3>
            {daysLeft > 0 ? (
                <p>You have {daysLeft} day{daysLeft !== 1 ? 's' : ''} to submit your peer assessment.</p>
            ) : (
                <p>The submission deadline has passed!</p>
            )}
        </div>
    );
};

export default Reminder;
