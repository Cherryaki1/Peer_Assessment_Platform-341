import React from 'react'
import StudentSideBar from '../_StudentSidebar'
import axios from 'axios'
import { useEffect, useState } from 'react'

const StudentGrades = () => {
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
    
    return (
        <div className="manage-classes-container" style={{ display: 'flex' }}>
            <StudentSideBar />
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <h2>Your Ratings</h2>
                {Object.keys(gradesByClass).map(classID => (
                        <div key={classID} className="class-section" style={{ marginBottom: '20px' }}>
                            <h3>Class ID: {classID}</h3>
                            {gradesByClass[classID].map(group => {
                                // Calculate ratings for each group
                                const ratingsForGroup = userStudent.Ratings.reduce((acc, rating) => {
                                    
                                    // Filter ratings to only include those for the specified classID
                                    if (rating.classID == classID) {
                                        rating.dimensions.forEach(dimension => {
                                            
                                            dimension.groupRatings.forEach(groupRating => {
                                                // Check if the rating is from a rater in the current group
                                                const raterInGroup = group.raterStudents.find(raterStudent => raterStudent.ID === groupRating.raterID);
                                                
                                                
                                                if (raterInGroup) {
                                                    // Initialize accumulator for dimension if it doesn't exist
                                                    if (!acc[dimension.dimensionName]) {
                                                        acc[dimension.dimensionName] = { total: 0, count: 0, comments: []};
                                                    }
                                                    // Add rating value to total and increment count
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
                                // Prepare an array of dimensions with their average ratings and count
                                const averagedRatings = Object.keys(ratingsForGroup).map(dimensionName => {
                                    const { total, count, comments } = ratingsForGroup[dimensionName];
                                    return {
                                        dimensionName,
                                        averageRating: count > 0 ? (total / count).toFixed(2) : "N/A",
                                        count,
                                        comments,
                                    };
                                });
                                console.log("Averaged Ratings:", averagedRatings);
                                return (
                                    <div key={group.groupID} className="group-section" style={{ marginBottom: '15px' }}>
                                        <h4>Group: {group.groupName} (Group ID: {group.groupID})</h4>
                                        <p><strong>Number of Ratings:</strong> {totalRatingsCount}</p>
                                        <ul>
                                            {averagedRatings.length > 0 ? (
                                                averagedRatings.map((dimension, index) => (
                                                    <li key={index}>
                                                        <strong>{dimension.dimensionName}</strong> - 
                                                        <strong> Average Rating:</strong> {dimension.averageRating}
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
                                                    </li>
                                                ))
                                            ) : (
                                                <li>No ratings available</li>
                                            )}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default StudentGrades;