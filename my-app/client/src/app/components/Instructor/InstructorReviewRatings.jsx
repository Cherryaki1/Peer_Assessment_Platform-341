import React from 'react'
import InstructorSideBar from '../_InstructorSidebar'
import axios from 'axios'
import { useEffect, useState } from 'react'

const InstructorReviewRatings = () => {
    const [gradesByClass, setGradesByClass] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userID, setUserID] = useState('');
    const [userStudent, setUserStudent] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch the logged-in user data (student)
                const response = await axios.get('http://localhost:3000/index', {
                    withCredentials: true,
                });
                
                if (response.data.user && response.data.user.ID) {
                    const userID = response.data.user.ID;
                    setUserID(userID); // Store the student's ID
                    fetchStudentFromUser();
                    fetchGrades(userID);
                } else {
                    setMessage('Failed to retrieve students data.');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setMessage('Error fetching user data.');
            }
        };    

        const fetchStudentFromUser = async () => {
            try {
                const response = await axios.get('http://localhost:3000/studentFromUser', {
                    withCredentials: true,
                });
    
                if (response.data.student && response.data.student.Groups) {
                    setUserStudent(response.data.student);
                } else {
                    setMessage('Student not found or no group data available.');
                }
            } catch (error) {
                console.error('Error fetching student from user:', error);
                setMessage('Error fetching student data.');
            }
        };

        const fetchGrades = async (userID) => {
            try {
                const response = await axios.get(`http://localhost:3000/getInstructorGrades`, {
                    params: { userID }
                });
                setGradesByClass(response.data);
            } catch (err) {
                console.error("Error fetching grades:", err);
                setError('Failed to load grades');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);
    
    if (loading) return <p>Loading grades...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="manage-classes-container" style={{ display: 'flex' }}>
            <InstructorSideBar />
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <div
                    className="
                    w-full 
                    bg-blue-500 
                    text-white 
                    py-10 
                    text-center 
                    rounded-md 
                    mb-4"
                >
                    <h2
                        className="
                        text-3xl 
                        font-bold"
                    >
                        Your Ratings
                    </h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {Object.keys(gradesByClass).map((classID) => (
                        <div
                            key={classID}
                            className="
                            p-4 
                            border 
                            rounded-md 
                            bg-gray-200"
                        >
                            <h3
                                className="
                                text-xl 
                                font-bold  
                                text-center"
                            >
                                Class ID: {classID}
                            </h3>
                            {gradesByClass[classID].map((rating, index) => (
                                <div key={index} className="group-section mb-4">
                                    <h4
                                        className="
                                        text-lg 
                                        font-bold 
                                        text-center 
                                        mb-2"
                                    >
                                        Group: {rating.groupName} (ID: {rating.groupID})
                                    </h4>
                                    <p>Number of Ratings: {rating.totalRatings}</p>
                                    <div className="grid grid-cols-1 gap-2 mb-2">
                                        {rating.dimensions.map((dimension, dimIndex) => (
                                            <div
                                                key={dimIndex}
                                                className="p-2 border rounded-md bg-white"
                                            >
                                                <strong>{dimension.dimensionName}</strong> - Average Rating:{" "}
                                                {dimension.averageRating}
                                                <ul>
                                                    {dimension.comments.length > 0 ? (
                                                        dimension.comments.map((comment, commentIndex) => (
                                                            <li key={commentIndex}>
                                                                <strong>Comment:</strong> {comment}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li>No comments</li>
                                                    )}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
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