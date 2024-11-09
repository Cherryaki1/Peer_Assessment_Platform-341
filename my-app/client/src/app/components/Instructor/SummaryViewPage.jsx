import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const SummaryViewPage = () => {
    const { classID } = useParams(); // Get classID from the URL
    const [students, setStudents] = useState([]);
    const [groupDetails, setGroupDetails] = useState([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Function to fetch data from the backend
    const fetchStudents = async () => {
        try {
            console.log(`Fetching data for classID: ${classID}`);
            const response = await axios.get(`http://localhost:3000/studentsSummary/${classID}`, {
                withCredentials: true,  // Ensures credentials (cookies) are sent
            });
            console.log('Response data:', response.data);
            setGroupDetails(response.data.groupDetails || []);
            setStudents(response.data.studentSummary || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch student data when the component is mounted or classID changes
    useEffect(() => {
        if (classID) {
            fetchStudents();
        }
    }, [classID]);

    if (loading) {
        return <div>Loading data...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!students.length) {
        return <div>No students found for this class.</div>;
    }

    return (
        <div>
            <h1>Summary View for Class {classID}</h1>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Student ID</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Last Name</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>First Name</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Team</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Cooperation</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Conceptual Contribution</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Practical Contribution</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Work Ethic</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Average</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Peers Who Responded</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => {
                        // Store each cell's content in a separate variable
                        const studentID = student.ID;
                        const lastName = student.LastName;
                        const firstName = student.FirstName;
                        const team = (student.Groups.length > 0 && groupDetails.length > 0) ? student.Groups.map(groupID => groupDetails[groupID]) : 'No Team';
                        const cooperation = getDimensionRating(student, 'Cooperation', classID);
                        const conceptualContribution = getDimensionRating(student, 'Conceptual Contribution', classID);
                        const practicalContribution = getDimensionRating(student, 'Practical Contribution', classID);
                        const workEthic = getDimensionRating(student, 'Work Ethic', classID);
                        const average = calculateStudentAverage(cooperation,conceptualContribution,practicalContribution,workEthic);
                        const peersWhoResponded = getPeersWhoResponded(student, classID);
    
                        return (
                            <tr key={student.ID}>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{studentID}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{lastName}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{firstName}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{team}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{cooperation}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{conceptualContribution}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{practicalContribution}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{workEthic}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{average}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{peersWhoResponded}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );    
};

// Helper function to calculate the average rating for a given dimension, ensuring the rater is in the same class
const getDimensionRating = (student, dimensionName, classID) => {
    const ratings = [];

    // Ensure student.Ratings exists
    if (student.Ratings.length !== 0) {
        student.Ratings.forEach(rating => {
            // Check if the rater is in the same class as the student
            if (classID == rating.classID) {
                // Check if the rating has dimensions
                if (rating.dimensions.length !== 0) {
                    rating.dimensions.forEach(dimension => {
                        // Check if the dimension name matches
                        if (dimension.dimensionName === dimensionName && dimension.groupRatingslength !== 0) {
                            dimension.groupRatings.forEach(groupRating => {
                                // Ensure raterID and ratingValue exist
                                if (groupRating.ratingValue) {
                                        // If they are in the same class, add the rating to the ratings array
                                        ratings.push(parseInt(groupRating.ratingValue));
                                }
                            });
                        }
                    });
                }
            }
        });
    }

    // If there are ratings, return the average, otherwise return 'N/A'
    if (ratings.length !== 0){
        console.log("student:",student.ID, "ratings:",ratings, "dimensionName:",dimensionName )
    }
    return ratings.length !== 0 ? calculateAverage(ratings) : 'No Rating';
};


// Function to calculate the number of unique peers who have responded
const getPeersWhoResponded = (student, classID) => {
    let uniqueRaters = 0;
    // Ensure student.Ratings exists
    if (student.Ratings.length !== 0) {
        student.Ratings.forEach(rating => {
            // Check if the rater is in the same class as the student
            if (classID == rating.classID) {
                uniqueRaters = uniqueRaters + 1;
            }
        });
    }

    return uniqueRaters;
};


// Calculate the overall average rating for a student across all dimensions
const calculateStudentAverage = (cooperation,conceptualContribution,practicalContribution,workEthic) => {
    const sumAllRatings = 
        parseFloat(cooperation) + 
        parseFloat(conceptualContribution) + 
        parseFloat(practicalContribution) + 
        parseFloat(workEthic);
    console.log(sumAllRatings)
    return sumAllRatings !== 0 ? parseFloat(sumAllRatings/4).toFixed(1) : 'N/A';
};

// Helper function to calculate the average of an array
const calculateAverage = (arr) => {
    const sum = arr.reduce((acc, num) => acc + num, 0);
    return parseFloat(sum / arr.length).toFixed(1);
};

export default SummaryViewPage;
