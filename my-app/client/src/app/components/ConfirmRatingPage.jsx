import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { StudentManageGroups } from './StudentManageGroups';

const ConfirmRatingPage = () => {

    const [confirmed, setConfirmed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const classID = location.state?.classID || '';
    const student = location.state?.student || { name: 'Unknown', id: 'Unknown' };
    const ratingValues = location.state?.ratingValues || {};
    const ratings = location.state?.ratings || [];
    const comments = location.state?.comments || {};
    const [userID, setuser] = useState(); // Store student's ID

    const fetchUserData = async () => {
        try {
            // Fetch the logged-in user data (student)
            const response = await axios.get('http://localhost:3000/index', {
                withCredentials: true,
            });
            
            if (response.data.user) {
                const userID = response.data.user.ID;
                setuser(userID); // Store the student's ID
            } else {
                console.error('Failed to retrieve students data.');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    // Handle checkbox change for confirmation
    const handleCheckboxChange = () => {
        setConfirmed((prevConfirmed) => !prevConfirmed);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if(!confirmed) return;

        fetchUserData();

        try {
            const response = await axios.post(`http://localhost:3000/ratingsSubmit`, {
                studentID: student.id,  // Assuming student.ID is the student’s unique identifier
                classID: classID,  // Replace 101 with the appropriate class ID
                dimensions: Object.keys(ratingValues).map(dimensionName => ({
                    dimensionName: ratings.find(rating => rating.id === dimensionName).title,
                    groupRatings: [
                        {
                            raterID: userID,  // The ID of the student who is giving the rating
                            ratingValue: ratingValues[dimensionName],
                            comments: comments[dimensionName] || '' // Default to empty if no comment
                        }
                    ]
                }))
            });
            alert('Ratings submitted successfully!');
            navigate(`/studentManageGroups/${classID}`);
        } catch (error) {
            console.error('Error submitting ratings:', error);
            alert('Error submitting ratings: ' + (error.response?.data || error.message));
        }
    }

    // Function to render stars based on rating count
    const renderStars = (count) => {
        const maxStars = 5;
        const starSize = 20;
        const filledColor = '#ffc107';
        const emptyColor = '#e4e5e9';

        return (
            <span>
                {[...Array(maxStars)].map((_, index) => (
                    <FaStar
                        key={index}
                        size={starSize}
                        color={index < count ? filledColor : emptyColor}
                    />
                ))}
            </span>
        );
    };

    return (
        <div>
            <h2>Confirm Your Ratings for {student.name} (ID: {student.id})</h2>
            <form onSubmit={handleSubmit}>
                {ratingValues ? (
                    <ul>
                        {Object.entries(ratingValues).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}</strong>: {renderStars(value)}
                                <p>Comment: {comments[key] || 'No comment provided'}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No ratings submitted.</p>
                )}
                <label>
                    <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={handleCheckboxChange}
                    />
                    I confirm that my ratings are correct and cannot be modified.

                </label>
                <button type="submit" disabled={!confirmed}>Submit</button>
            </form>
        </div>
    );
};

export default ConfirmRatingPage;
