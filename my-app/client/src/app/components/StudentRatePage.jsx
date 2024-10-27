import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

const StudentRatePage = ({ ratings }) => {
    const [ratingValues, setRatingValues] = useState({});
    const [hoverRatings, setHoverRatings] = useState({});  // Store hover states for each rating item
    const [comments, setComments] = useState({});
    
    const navigate = useNavigate();
    const location = useLocation();
    const student = location.state?.student || { name: 'Unknown', id: 'Unknown' }; // Fallback in case student data is missing

    // Handle rating input for each criterion
    const handleRating = (ratingId, rating) => {
        setRatingValues(prevRatings => ({
            ...prevRatings,
            [ratingId]: rating,
        }));
    };

    // Handle hover change for a specific rating item
    const handleHover = (ratingId, hoverValue) => {
        setHoverRatings(prevHovers => ({
            ...prevHovers,
            [ratingId]: hoverValue,  // Set hover state for the specific rating item
        }));
    };

    // Handle comment input for each criterion
    const handleComment = (ratingId, comment) => {
        setComments(prevComments => ({
            ...prevComments,
            [ratingId]: comment,
        }));
    };

    // Navigate to confirmation page with data
    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/confirm-rating', { state: { ratingValues, comments, student } });
    };

    return (
        <div>
            <h2>Rate {student.name} (ID: {student.id})</h2>
            <form onSubmit={handleSubmit}>
                {ratings.map((rating) => (
                    <div key={rating.id}>
                        <h4>{rating.title}</h4>
                        {[...Array(5)].map((_, i) => {
                            const ratingValue = i + 1;
                            const isSelected = ratingValue <= (ratingValues[rating.id] || 0);

                            return (
                                <label key={ratingValue}>
                                    <input
                                        type="radio"
                                        name={rating.title}
                                        value={ratingValue}
                                        onClick={() => handleRating(rating.id, ratingValue)}
                                        style={{ display: 'none' }} 
                                    />
                                    <FaStar
                                        size={30}
                                        color={ratingValue <= (hoverRatings[rating.id] || ratingValues[rating.id]) ? "#ffc107" : "#e4e5e9"}
                                        onMouseEnter={() => handleHover(rating.id, ratingValue)}
                                        onMouseLeave={() => handleHover(rating.id, null)}
                                    />
                                </label>
                            );
                        })}
                        <textarea 
                            placeholder={`Add a comment for ${rating.title}`}
                            value={comments[rating.id] || ''}
                            onChange={(e) => handleComment(rating.id, e.target.value)}
                        />
                    </div>
                ))}
                <button type="submit">Submit Rating</button>
            </form>
        </div>
    );
};

export default StudentRatePage;
