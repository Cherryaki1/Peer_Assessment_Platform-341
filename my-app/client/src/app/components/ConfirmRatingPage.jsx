import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const ConfirmRatingPage = () => {
    const [confirmed, setConfirmed] = useState(false);
    const location = useLocation();
    
    // Destructure location.state values with fallback
    const {
        ratingValues = {},
        comments = {},
        student = { name: 'Unknown', id: 'Unknown' },
    } = location.state || {};

    // Handle checkbox change for confirmation
    const handleCheckboxChange = () => {
        setConfirmed((prevConfirmed) => !prevConfirmed);
    };

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
            <button disabled={!confirmed}>Submit</button>
        </div>
    );
};

export default ConfirmRatingPage;
