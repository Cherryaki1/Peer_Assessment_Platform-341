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
                        <th scope="col" style={{ border: '1px solid black', padding: '8px' }}>Student ID</th>
                        <th scope="col" style={{ border: '1px solid black', padding: '8px' }}>Last Name</th>
                        <th scope="col" style={{ border: '1px solid black', padding: '8px' }}>First Name</th>
                        <th scope="col" style={{ border: '1px solid black', padding: '8px' }}>Team</th>
                        <th scope="col" style={{ border: '1px solid black', padding: '8px' }}>Cooperation</th>
                        <th scope="col" style={{ border: '1px solid black', padding: '8px' }}>Conceptual Contribution</th>
                        <th scope="col" style={{ border: '1px solid black', padding: '8px' }}>Practical Contribution</th>
                        <th scope="col" style={{ border: '1px solid black', padding: '8px' }}>Work Ethic</th>
                        <th scope="col" style={{ border: '1px solid black', padding: '8px' }}>Average</th>
                        <th scope="col" style={{ border: '1px solid black', padding: '8px' }}>Peers Who Responded</th>
                    </tr>
                </thead>
                <tbody>

                    {students.map((student) => (
                        <tr key={student.ID}>
                            <td style={{ border: '1px solid black', padding: '8px' }}>{student.ID}</td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>{student.LastName}</td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>{student.FirstName}</td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>
                                {student.Groups.map(groupID => groupDetails[groupID])}
                            </td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>{getDimensionRating(student, 'Cooperation')}</td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>{getDimensionRating(student, 'Conceptual Contribution')}</td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>{getDimensionRating(student, 'Practical Contribution')}</td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>{getDimensionRating(student, 'Work Ethic')}</td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>{calculateAverage(student)}</td>
                            <td style={{ border: '1px solid black', padding: '8px' }}>{getPeersWhoResponded(student) || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Function to get the rating value for a specific dimension
const getDimensionRating = (student, dimensionName) => {
    const dimension = student.Ratings?.[0]?.dimensions?.find(d => d.dimensionName === dimensionName);
    if (dimension) {
        const ratings = dimension.groupRatings;
        const sum = ratings.reduce((acc, rating) => acc + (rating.ratingValue || 0), 0);
        const total = ratings.filter(rating => rating.ratingValue != null).length;
        return total > 0 ? (sum / total).toFixed(1) : 'N/A';
    }
    return 'N/A';
};

// Function to calculate the number of unique peers who have responded
const getPeersWhoResponded = (student) => {
    const allRaters = student.Ratings?.[0]?.dimensions
        .flatMap(dimension => dimension.groupRatings.map(rating => rating.raterID));
    
    const uniqueRaters = new Set(allRaters);

    return uniqueRaters.size;
};

// Function to calculate average based on dimensions
const calculateAverage = (student) => {
    const dimensions = ['Cooperation', 'ConceptualContribution', 'PracticalContribution', 'WorkEthic'];
    const ratings = dimensions.map(dim => getDimensionRating(student, dim));
    const sum = ratings.reduce((acc, val) => acc + (val !== 'N/A' ? parseFloat(val) : 0), 0);
    const total = ratings.filter(val => val !== 'N/A').length;
    return total > 0 ? (sum / total).toFixed(1) : 'N/A';
};

export default SummaryViewPage;
