import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const ConfirmInstructorRating = () => {
    const [confirmed, setConfirmed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Extract passed state
    const instructor = location.state?.instructor || { name: 'Unknown', id: 'Unknown' };
    const ratingList = location.state?.ratings || []; // Use ratingList instead of ratings
    const ratingValues = location.state?.ratingValues || {};
    const comments = location.state?.comments || {};
    const classInfo = location.state?.classInfo || { name: 'Unknown Class', subject: 'Unknown Subject', section: 'Unknown Section' }; 
    const [userID, setUser] = useState(); 

    useEffect(() => {
        fetchUserData();   
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://localhost:3000/index', {
                withCredentials: true,
            });
            
            if (response.data.user) {
                setUser(response.data.user.ID);
            } else {
                console.error('Failed to retrieve student data.');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleCheckboxChange = () => {
        setConfirmed((prevConfirmed) => !prevConfirmed);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!confirmed) return;
    
        try {
            const response = await axios.post(`http://localhost:3000/instructorRatingsSubmit`, {
                studentID: userID,  // Student ID
                classID: classInfo.id,  // Class ID associated with the rating
                instructorID: instructor.id,     // Instructor ID to identify the instructor in the backend
                dimensions: Object.keys(ratingValues).map(dimensionId => ({
                    dimensionName: ratingList.find(rating => rating.id === parseInt(dimensionId))?.title || 'Unknown', // Use ratingList instead of ratings
                    classRatings: [
                        {
                            raterID: userID,  // ID of the student giving the rating
                            ratingValue: ratingValues[dimensionId],  // Rating value
                            comments: comments[dimensionId] || ''  // Optional comments
                        }
                    ]
                }))
            });
            alert('Ratings submitted successfully!');
            navigate(`/studentRateMyInstructor`, {replace:true});
        } catch (error) {
            console.error('Error submitting ratings:', error);
            alert('Error submitting ratings: ' + (error.response?.data || error.message));
        }
    };
    

    const renderStars = (count) => {
        return (
            <span>
                {[...Array(5)].map((_, index) => (
                    <FaStar
                        key={index}
                        size={20}
                        color={index < count ? '#ffc107' : '#e4e5e9'}
                    />
                ))}
            </span>
        );
    };

    return (
        <div>
            <h2>Confirm Your Ratings for {instructor.name}</h2>
            <h3>Class: {classInfo.name} - {classInfo.subject} (Section: {classInfo.section})</h3> {/* Display class info */}
            <form onSubmit={handleSubmit}>
                {ratingValues && Object.keys(ratingValues).length > 0 ? (
                    <ul>
                        {Object.entries(ratingValues).map(([dimensionId, value]) => {
                            const dimensionTitle = ratingList.find(rating => rating.id === parseInt(dimensionId))?.title || 'Unknown';
                            return (
                                <li key={dimensionId}>
                                    <strong>{dimensionTitle}</strong>: {renderStars(value)}
                                    <p>Comment: {comments[dimensionId] || 'No comment provided'}</p>
                                </li>
                            );
                        })}
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

export default ConfirmInstructorRating;

