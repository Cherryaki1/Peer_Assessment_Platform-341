import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import StudentSidebar from '../../_StudentSidebar';

const ConfirmRatingPage = () => {
    const [confirmed, setConfirmed] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalButtonText, setModalButtonText] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const classID = location.state?.classID || '';
    const student = location.state?.student || { name: 'Unknown', id: 'Unknown' };
    const ratingList = location.state?.ratings || [];
    const ratingValues = location.state?.ratingValues || {};
    const comments = location.state?.comments || {};
    const [userID, setUser] = useState(); // Store student's ID

    useEffect(() => {
        fetchUserData();   
    }, []);

    const fetchUserData = async () => {
        try {
            // Fetch the logged-in user data (student)
            const response = await axios.get('http://localhost:3000/index', {
                withCredentials: true,
            });
            
            if (response.data.user) {
                const userID = response.data.user.ID;
                setUser(userID); // Store the student's ID
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
        
        if (!confirmed) return;

        try {
            const response = await axios.post(`http://localhost:3000/studentRatingsSubmit`, {
                studentID: userID,  // Student ID
                classID: classID,  // Class ID associated with the rating
                dimensions: Object.keys(ratingValues).map(dimensionName => ({
                    dimensionName: (ratingList.find(rating => rating.id === dimensionName)).title,
                    groupRatings: [
                        {
                            raterID: userID,  // The ID of the student who is giving the rating
                            ratingValue: ratingValues[dimensionName],
                            comments: comments[dimensionName] || '' // Default to empty if no comment
                        }
                    ]
                }))
            });
            setModalMessage('Ratings submitted successfully!');
            setModalButtonText('OK');
        } catch (error) {
            console.error('Error submitting ratings:', error);
            setModalMessage('Error submitting ratings: ' + (error.response?.data || error.message));
            setModalButtonText('Try Again');
        }

        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        if (modalButtonText === 'OK') {
            navigate(`/studentManageGroups/${classID}`);
        }
    };

    // Function to render stars based on rating count
    const renderStars = (count) => {
        const maxStars = 5;
        const starSize = 45;
        const filledColor = '#ffc107';
        const emptyColor = '#e4e5e9';

        return (
            <span className="flex justify-center mb-2 space-x-2">
                {[...Array(maxStars)].map((_, index) => (
                    <FaStar
                        key={index}
                        size={starSize}
                        className="mx-1"
                        color={index < count ? filledColor : emptyColor}
                    />
                ))}
            </span>
        );
    };

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
                        ">Confirm Your Ratings for {student.name}</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        {ratingValues ? (
                            Object.entries(ratingValues).map(([key, value]) => (
                                <div key={key} className="p-4 border rounded-md text-center bg-gray-200" style={{ height: '300px' }}>
                                    <h4 className="text-lg font-bold mb-2">{key}</h4>
                                    {renderStars(value)}
                                    <p className="text-left">Comment: {comments[key] || 'No comment provided'}</p>
                                </div>
                            ))
                        ) : (
                            <p>No ratings submitted.</p>
                        )}
                    </div>
                    <label className="block mb-4">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={handleCheckboxChange}
                            className="mr-2"
                        />
                        I confirm that my ratings are correct and cannot be modified.
                    </label>
                    <button 
                        type="submit" 
                        className={`mt-4 p-2 rounded-md transition duration-300 ${confirmed ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} 
                        disabled={!confirmed}
                    >
                        Submit
                    </button>
                </form>
                {showModal && (
                    <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-5 rounded shadow-lg text-center">
                            <p>{modalMessage}</p>
                            <button 
                                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors duration-300"
                                onClick={handleModalClose}
                            >
                                {modalButtonText}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfirmRatingPage;