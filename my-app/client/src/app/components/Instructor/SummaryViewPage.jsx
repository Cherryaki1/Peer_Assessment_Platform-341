import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types'; // Import PropTypes for prop validation

const SummaryView = ({ classID }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Function to fetch data from the backend
    const fetchStudents = async () => {
        try {
            console.log(`Fetching data for classID: ${classID}`);
            const response = await axios.get(`http://localhost:3000/studentsSummary/${classID}`);
            console.log('Response data:', response.data); // Log the response data
            setStudents(response.data.studentSummary || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    

    // Function to calculate average rating for a student
    const calculateAverage = (student) => {
        const { cooperation, conceptualContribution, practicalContribution, workEthic } = student;
        const sum = [cooperation, conceptualContribution, practicalContribution, workEthic]
            .reduce((acc, val) => acc + (val || 0), 0);
        const total = [cooperation, conceptualContribution, practicalContribution, workEthic]
            .filter(val => val != null).length;

        return total > 0 ? (sum / total).toFixed(1) : 'N/A'; // Avoid division by zero
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
    if (!students.length) return <div>No students found for this class.</div>;

    return (
        <div>
            <h1>Summary View for Class {classID}</h1>
            {error ? (
                <p>{error}</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Student ID</th>
                            <th scope="col">Last Name</th>
                            <th scope="col">First Name</th>
                            <th scope="col">Team</th>
                            <th scope="col">Cooperation</th>
                            <th scope="col">Conceptual Contribution</th>
                            <th scope="col">Practical Contribution</th>
                            <th scope="col">Work Ethic</th>
                            <th scope="col">Average</th>
                            <th scope="col">Peers Who Responded</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan="10">No students data available.</td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.StudentID}>
                                    <td>{student.StudentID}</td>
                                    <td>{student.LastName}</td>
                                    <td>{student.FirstName}</td>
                                    <td>{student.Team || 'No team assigned'}</td>
                                    <td>{student.Cooperation || 'N/A'}</td>
                                    <td>{student.ConceptualContribution || 'N/A'}</td>
                                    <td>{student.PracticalContribution || 'N/A'}</td>
                                    <td>{student.WorkEthic || 'N/A'}</td>
                                    <td>{calculateAverage(student)}</td>
                                    <td>{student.PeersWhoResponded || 0}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};


export default SummaryView;
