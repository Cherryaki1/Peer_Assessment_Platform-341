import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const Rate = ({ ratings }) => {
    const [ratingValues, setRatingValues] = useState({});  // Store ratings for each rating item
    const [hoverRatings, setHoverRatings] = useState({});  // Store hover states for each rating item
    const [comments, setComments] = useState({});  // Store comments for each rating item

    // Handle rating change for a specific rating item
    const handleRating = (ratingId, rating) => {
        setRatingValues(prevRatings => ({
            ...prevRatings,
            [ratingId]: rating,  // Set rating for the specific rating item
        }));
    };

    // Handle hover change for a specific rating item
    const handleHover = (ratingId, hoverValue) => {
        setHoverRatings(prevHovers => ({
            ...prevHovers,
            [ratingId]: hoverValue,  // Set hover state for the specific rating item
        }));
    };

    // Handle comment change for a specific rating item
    const handleCommentChange = (ratingId, comment) => {
        setComments(prevComments => ({
            ...prevComments,
            [ratingId]: comment,  // Set comment for the specific rating item
        }));
    };

    return (
        <form>
            {ratings.map((rating) => (
                <div key={rating.id} style={{ marginBottom: '20px' }}>
                    <h4>{rating.title}</h4>
                    {[...Array(5)].map((_, index) => {
                        const currentRating = index + 1;
                        return (
                            <label key={`${rating.id}-star-${index}`}>
                                <input 
                                    type="radio" 
                                    name={`rating-${rating.id}`}  // Unique name for each rating item
                                    value={currentRating}
                                    onClick={() => handleRating(rating.id, currentRating)}
                                    style={{ display: 'none' }}  // Hide radio button
                                />
                                <FaStar 
                                    className='star'
                                    size={25} 
                                    color={currentRating <= (hoverRatings[rating.id] || ratingValues[rating.id]) ? "#ffc107" : "#e4e5e9"}
                                    onMouseEnter={() => handleHover(rating.id, currentRating)}
                                    onMouseLeave={() => handleHover(rating.id, null)}
                                />
                            </label>
                        );
                    })}
                    <textarea 
                        placeholder="Leave a comment..." 
                        value={comments[rating.id] || ""}  // Set the comment for the specific rating item
                        onChange={(e) => handleCommentChange(rating.id, e.target.value)} 
                        style={{ width: '90%', marginTop: '10px', padding: '10px', fontSize: '16px' }}
                    />
                </div>
            ))}
            <button type="submit">Submit rating</button>
        </form>
    );
};

export default Rate;
