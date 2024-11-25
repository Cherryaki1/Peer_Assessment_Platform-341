import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import StudentSidebar from '../../_StudentSidebar';

const StudentRatePage = ({ ratings }) => {
    const [ratingValues, setRatingValues] = useState({});
    const [hoverRatings, setHoverRatings] = useState({});  // Store hover states for each rating item
    const [comments, setComments] = useState({});
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const classID = location.state?.classID || '';
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
        navigate('/confirmStudentRating', { state: { ratings, ratingValues, comments, student, classID } });
    };

    // Check if all dimensions have been rated
    const allRated = ratings.every(rating => ratingValues[rating.id]);

    return (
        <div className="flex">
            <StudentSidebar />
            <div className="content p-5 flex-1">
                <div className="
                    w-full 
                    bg-emerald-500 
                    text-white 
                    py-10 
                    text-center 
                    rounded-md 
                    mb-4">
                    <h2 className="
                        text-3xl 
                        font-bold
                        ">Rate {student.name} as a teammate</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        {ratings.map((rating) => (
                            <div key={rating.id} className="p-4 border rounded-md text-center">
                                <h4 className="text-lg font-bold mb-2">{rating.title}</h4>
                                <div className="flex justify-center mb-2 space-x-2">
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
                                                    size={45}
                                                    className="mx-1"
                                                    color={ratingValue <= (hoverRatings[rating.id] || ratingValues[rating.id]) ? "#ffc107" : "#e4e5e9"}
                                                    onMouseEnter={() => handleHover(rating.id, ratingValue)}
                                                    onMouseLeave={() => handleHover(rating.id, null)}
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                                <textarea 
                                    placeholder={`Add a comment for ${rating.title} (Optional)`}
                                    value={comments[rating.id] || ''}
                                    onChange={(e) => handleComment(rating.id, e.target.value)}
                                    className="w-full h-40 mt-2 p-2 border rounded-md resize-none"
                                />
                            </div>
                        ))}
                    </div>
                    <button 
                        type="submit" 
                        className={`mt-4 p-2 rounded-md transition duration-300 ${allRated ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} 
                        disabled={!allRated}
                    >
                        Next
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentRatePage;