import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import StudentSidebar from '../../_StudentSidebar';

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
                        mb-2">
                        Rate {instructor.name} as an instructor
                    </h2>
                    <h3>Class: {classInfo.name} - {classInfo.subject} (Section: {classInfo.section})</h3>
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

export default InstructorRatePage;