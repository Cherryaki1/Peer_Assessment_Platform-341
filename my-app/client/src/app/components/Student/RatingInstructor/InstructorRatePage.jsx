import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

const InstructorRatePage = () => {
    const [ratingValues, setRatingValues] = useState({});
    const [hoverRatings, setHoverRatings] = useState({});
    const [comments, setComments] = useState({});
    const [instructor, setInstructor] = useState(null); // Instructor details
    const [ratings, setRatings] = useState([]); // Rating criteria
    const [student, setStudent] = useState(null); // Store student info for authorization
    
    const navigate = useNavigate();
    const { instructorID } = useParams();
    const location = useLocation();
    const classInfo = location.state?.classInfo || { name: 'Unknown Class', subject: 'Unknown Subject', section: 'Unknown Section' }; // Class info from location

    useEffect(() => {
        fetchUserData();
        fetchInstructorDetails();
    }, [instructorID]);

    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://localhost:3000/index', { withCredentials: true });
            if (response.data.user) {
                setStudent(response.data.user);
            } else {
                // If the user is not authenticated, redirect to login or show an error
                navigate('/login');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            navigate('/login'); // Redirect to login if there's an error
        }
    };

    const fetchInstructorDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/studentRateMyInstructor/${instructorID}`, {
                withCredentials: true,
            });
            setInstructor(response.data.instructor);
            setRatings(response.data.ratings);
        } catch (error) {
            console.error('Error fetching instructor details:', error);
        }
    };
    
    const handleRating = (ratingId, rating) => {
        setRatingValues(prevRatings => ({
            ...prevRatings,
            [ratingId]: rating,
        }));
    };

    const handleHover = (ratingId, hoverValue) => {
        setHoverRatings(prevHovers => ({
            ...prevHovers,
            [ratingId]: hoverValue,
        }));
    };

    const handleComment = (ratingId, comment) => {
        setComments(prevComments => ({
            ...prevComments,
            [ratingId]: comment,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/confirmInstructorRating', { 
            state: { 
                ratings, 
                ratingValues, 
                comments, 
                instructor,
                classInfo // Pass class info to ConfirmInstructorRating
            } 
        });
    };

    if (!instructor) return <p>Loading...</p>;

    return (
        <div>
            <h2>Rate {instructor.name} as an instructor</h2>
            <h3>Class: {classInfo.name} - {classInfo.subject} (Section: {classInfo.section})</h3> {/* Display class info */}
            <form onSubmit={handleSubmit}>
                {ratings.map((rating) => (
                    <div key={rating.id}>
                        <h4>{rating.title}</h4>
                        {[...Array(5)].map((_, i) => {
                            const ratingValue = i + 1;
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
                <button type="submit">Next</button>
            </form>
        </div>
    );
};

export default InstructorRatePage;
