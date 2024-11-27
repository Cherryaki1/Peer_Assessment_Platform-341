import React, { useEffect, useState } from 'react';
import axios from 'axios';
import InstructorSideBar from '../_InstructorSidebar';

const InstructorReviewRatings = () => {
    const [gradesByClass, setGradesByClass] = useState([]); // Initialize as an array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:3000/index', { withCredentials: true });
                if (response.data.user && response.data.user.ID) {
                    const userID = response.data.user.ID;
                    fetchGrades(userID);
                } else {
                    setMessage('Failed to retrieve instructor data.');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setMessage('Error fetching user data.');
            }
        };

        const fetchGrades = async (userID) => {
            try {
                const response = await axios.get('http://localhost:3000/getInstructorGrades', {
                    params: { userID },
                });
                if (Array.isArray(response.data)) {
                    setGradesByClass(response.data); // Ensure it's stored as an array
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err) {
                console.error('Error fetching grades:', err);
                setError('Failed to load grades.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);


    return (
        <div className="manage-classes-container" style={{ display: 'flex' }}>
            <InstructorSideBar />
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <div className="w-full bg-blue-500 text-white py-10 text-center rounded-md">
                    <h2 className="text-3xl font-bold">Your Ratings</h2>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    {gradesByClass.map((classData) => (
                        <div
                            key={classData.classID}
                            className="p-4 border rounded-md bg-gray-200 shadow-md"
                        >
                            <h3 className="text-xl font-bold text-center mb-4">
                                Class ID: {classData.classID}
                            </h3>
                            {classData.dimensions.map((dimension, index) => (
                                <div key={index} className="p-2 border rounded-md bg-white my-2">
                                    <h4 className="font-bold">{dimension.dimensionName}</h4>
                                    <p>Average Rating: {dimension.averageRating}</p>
                                    <h5 className="font-bold mt-2">Comments:</h5>
                                    <ul className="list-disc list-inside">
                                        {dimension.comments.length > 0 ? (
                                            dimension.comments.map((comment, commentIndex) => (
                                                <li key={commentIndex}>{comment}</li>
                                            ))
                                        ) : (
                                            <li>No comments</li>
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InstructorReviewRatings;
