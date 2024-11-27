import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import InstructorSidebar from '../_InstructorSidebar';


const SummaryViewPage = () => {
    const { classID } = useParams(); // Get classID from the URL
    const [students, setStudents] = useState([]);
    const [groupDetails, setGroupDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStudents = async () => {
        try {
            console.log(`Fetching data for classID: ${classID}`);
            const response = await axios.get(`http://localhost:3000/studentsSummary/${classID}`, {
                withCredentials: true,
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
        <div className="summary-view-container" style={{ display: 'flex' }}>
            <InstructorSidebar />
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <div
                    className="
                    w-full bg-blue-500 text-white py-10 text-center rounded-md mb-4"
                >
                    <h1
                        className="
                        text-3xl font-bold"
                    >
                        Summary View for Class {classID}
                    </h1>
                </div>
                <div className="table-container overflow-x-auto">
                    <table
                        className="
                        w-full text-left border-collapse bg-white shadow-md rounded-lg"
                    >
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th className="px-4 py-2 border">Student ID</th>
                                <th className="px-4 py-2 border">Last Name</th>
                                <th className="px-4 py-2 border">First Name</th>
                                <th className="px-4 py-2 border">Team</th>
                                <th className="px-4 py-2 border">Cooperation</th>
                                <th className="px-4 py-2 border">Conceptual Contribution</th>
                                <th className="px-4 py-2 border">Practical Contribution</th>
                                <th className="px-4 py-2 border">Work Ethic</th>
                                <th className="px-4 py-2 border">Average</th>
                                <th className="px-4 py-2 border">Peers Who Responded</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => {
                                const studentID = student.ID;
                                const lastName = student.LastName;
                                const firstName = student.FirstName;
                                const allGroupsExist =
                                    Array.isArray(student.Groups) &&
                                    student.Groups.length > 0 &&
                                    student.Groups.some((groupID) =>
                                        groupDetails.hasOwnProperty(groupID)
                                    );
                                const team = allGroupsExist
                                    ? student.Groups.map(
                                          (studentGroupID) =>
                                              groupDetails[studentGroupID]
                                      )
                                    : 'No Teams';
                                const cooperation = getDimensionRating(
                                    student,
                                    'Cooperation',
                                    classID
                                );
                                const conceptualContribution =
                                    getDimensionRating(
                                        student,
                                        'Conceptual Contribution',
                                        classID
                                    );
                                const practicalContribution = getDimensionRating(
                                    student,
                                    'Practical Contribution',
                                    classID
                                );
                                const workEthic = getDimensionRating(
                                    student,
                                    'Work Ethic',
                                    classID
                                );
                                const average = calculateStudentAverage(
                                    cooperation,
                                    conceptualContribution,
                                    practicalContribution,
                                    workEthic
                                );
                                const peersWhoResponded = getPeersWhoResponded(
                                    student,
                                    classID
                                );

                                return (
                                    <tr
                                        key={studentID}
                                        className="hover:bg-gray-100"
                                    >
                                        <td className="px-4 py-2 border">
                                            {studentID}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {lastName}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {firstName}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {team}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {cooperation}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {conceptualContribution}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {practicalContribution}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {workEthic}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {average}
                                        </td>
                                        <td className="px-4 py-2 border">
                                            {peersWhoResponded}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const getDimensionRating = (student, dimensionName, classID) => {
    const ratings = [];
    if (student.Ratings && student.Ratings.length !== 0) {
        student.Ratings.forEach((rating) => {
            if (
                classID == rating.classID &&
                rating.dimensions &&
                rating.dimensions.length !== 0
            ) {
                rating.dimensions.forEach((dimension) => {
                    if (
                        dimension.dimensionName === dimensionName &&
                        dimension.groupRatings.length !== 0
                    ) {
                        dimension.groupRatings.forEach((groupRating) => {
                            if (groupRating.ratingValue) {
                                ratings.push(parseInt(groupRating.ratingValue));
                            }
                        });
                    }
                });
            }
        });
    }
    return ratings.length !== 0
        ? calculateAverage(ratings)
        : 'No Rating';
};

const getPeersWhoResponded = (student, classID) => {
    let uniqueRaters = 0;
    if (student.Ratings.length !== 0) {
        student.Ratings.forEach((rating) => {
            if (classID == rating.classID) {
                uniqueRaters = uniqueRaters + 1;
            }
        });
    }
    return uniqueRaters;
};

const calculateStudentAverage = (
    cooperation,
    conceptualContribution,
    practicalContribution,
    workEthic
) => {
    const ratings = [
        cooperation,
        conceptualContribution,
        practicalContribution,
        workEthic,
    ].filter((rating) => !isNaN(rating));
    const sum = ratings.reduce((acc, rating) => acc + parseFloat(rating), 0);
    return ratings.length
        ? (sum / ratings.length).toFixed(1)
        : 'N/A';
};

const calculateAverage = (arr) => {
    const sum = arr.reduce((acc, num) => acc + num, 0);
    return parseFloat(sum / arr.length).toFixed(1);
};

export default SummaryViewPage;