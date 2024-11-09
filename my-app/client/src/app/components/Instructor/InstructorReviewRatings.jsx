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
        <div className="content">
            <InstructorSideBar />
            <h2>Your Ratings</h2>
            {Object.keys(gradesByClass).length > 0 ? (
                Object.keys(gradesByClass).map(classID => (
                    <div key={classID} className="class-section" style={{ marginBottom: '20px' }}>
                        <h3 style={{ marginBottom: '10px' }}>Class ID: {classID}</h3>
                        {gradesByClass[classID].map((rating, index) => (
                            <div key={index} style={{ marginBottom: '15px', paddingLeft: '20px' }}>
                                <h4 style={{ borderBottom: '1px solid #ccc', marginBottom: '10px' }}>Rating Details</h4>
                                {rating.dimensions.map((dimension, dimIndex) => (
                                    <div key={dimIndex} style={{ marginBottom: '10px', paddingLeft: '20px' }}>
                                        <strong>Dimension:</strong> {dimension.dimensionName}
                                        <ul style={{ paddingLeft: '20px', listStyleType: 'none' }}>
                                            {dimension.classRatings.map((classRating, rateIndex) => (
                                                <li key={rateIndex} style={{ marginBottom: '5px', paddingLeft: '20px' }}>
                                                    <strong>Rating Value:</strong> {classRating.ratingValue} <br />
                                                    <p style={{ marginLeft: '10px' }}>
                                                        <strong>Comments:</strong>{' '}
                                                        {classRating.comments && classRating.comments.trim()
                                                            ? classRating.comments
                                                            : 'No Comments'}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                <p>No grades available.</p>
            )}
        </div>
    );
};

export default InstructorReviewRatings;
