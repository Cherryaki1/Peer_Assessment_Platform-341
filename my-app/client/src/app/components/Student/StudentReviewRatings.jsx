import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudentSideBar from '../_StudentSidebar';

const StudentReviewRatings = () => {
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
                    setMessage('Failed to retrieve student data.');
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
                const response = await axios.get(`http://localhost:3000/getUserGrades`, {
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
    

    if (error) return <p>{error}</p>;

    return (
        <div className="manage-classes-container" style={{ display: 'flex' }}>
            <StudentSideBar />
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <div className="
                    w-full 
                    bg-emerald-500 
                    text-white 
                    py-10 
                    text-center 
                    rounded-md 
                    mb-4"
                    data-testid="your-ratings">
                    <h2 className="
                        text-3xl 
                        font-bold
                        ">Your Ratings</h2>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {Object.keys(gradesByClass).map(classID => (
                        <div key={classID} className="
                        p-4 
                        border 
                        rounded-md 
                        bg-gray-200">
                            <h3 className="
                            text-xl 
                            font-bold  
                            text-center">Class ID: {classID}</h3>
                            {gradesByClass[classID].map(group => {
                                const ratingsForGroup = userStudent.Ratings.reduce((acc, rating) => {
                                    if (rating.classID == classID) {
                                        rating.dimensions.forEach(dimension => {
                                            dimension.groupRatings.forEach(groupRating => {
                                                const raterInGroup = group.raterStudents.find(raterStudent => raterStudent.ID === groupRating.raterID);
                                                if (raterInGroup) {
                                                    if (!acc[dimension.dimensionName]) {
                                                        acc[dimension.dimensionName] = { total: 0, count: 0, comments: []};
                                                    }
                                                    acc[dimension.dimensionName].total += groupRating.ratingValue;
                                                    acc[dimension.dimensionName].count += 1;
                                                    if (groupRating.comments) {
                                                        acc[dimension.dimensionName].comments.push(groupRating.comments);
                                                    }
                                                }
                                            });
                                        });
                                    }
                                    return acc;
                                }, {});

                                const totalRatingsCount = Object.values(ratingsForGroup).reduce((sum, dimension) => dimension.count, 0);
                                const averagedRatings = Object.keys(ratingsForGroup).map(dimensionName => {
                                    const { total, count, comments } = ratingsForGroup[dimensionName];
                                    return {
                                        dimensionName,
                                        averageRating: count > 0 ? (total / count).toFixed(2) : "N/A",
                                        count,
                                        comments,
                                    };
                                });

                                return (
                                    <div key={group.groupID} className="group-section mb-4">
                                        <h4 className="text-lg font-bold text-center mb-2">Group: {group.groupName} (ID: {group.groupID})</h4>
                                        <p>Number of Ratings: {totalRatingsCount}</p>
                                        <div className="grid grid-cols-1 gap-2 mb-2">
                                            {averagedRatings.map((dimension, index) => (
                                                <div key={index} className="p-2 border rounded-md bg-white">
                                                    <strong>{dimension.dimensionName}</strong> - Average Rating: {dimension.averageRating}
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
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentReviewRatings;