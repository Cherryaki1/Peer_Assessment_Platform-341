import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import InstructorSidebar from '../_InstructorSidebar';

const DetailedViewPage = () => {
    const { classID } = useParams();
    const [students, setStudents] = useState([]);
    const [groupDetails, setGroupDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [teamGroups, setTeamGroups] = useState({});

    const fetchStudents = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/detailView/${classID}`, {
                withCredentials: true,
            });
            
            setGroupDetails(response.data.groupDetails || []);
            setStudents(response.data.studentSummary || []);
            
            // Organize students by teams
            const groups = {};
            response.data.studentSummary.forEach(student => {
                if (Array.isArray(student.Groups)) {
                    student.Groups.forEach(groupID => {
                        if (!groups[groupID]) {
                            groups[groupID] = [];
                        }
                        groups[groupID].push(student);
                    });
                } else {
                    if (!groups['ungrouped']) {
                        groups['ungrouped'] = [];
                    }
                    groups['ungrouped'].push(student);
                }
            });
            setTeamGroups(groups);
        } catch (error) {
            setError(error.response?.status === 404 
                ? 'The requested resource was not found.' 
                : 'Failed to fetch data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (classID) {
            fetchStudents();
        }
    }, [classID]);

    const getTeamMemberRatings = (rater, ratee, groupID) => {
        // Find the rating object for this specific class and group
        const relevantRating = rater.Ratings?.find(rating => 
            rating.classID === parseInt(classID)  // Convert classID to number since it's stored as number in DB
        );

        if (!relevantRating) return null;

        // Get ratings for each dimension
        const ratings = {
            cooperation: findDimensionRating(relevantRating.dimensions, 'Cooperation', ratee.ID, rater.ID),
            conceptual: findDimensionRating(relevantRating.dimensions, 'Conceptual Contribution', ratee.ID, rater.ID),
            practical: findDimensionRating(relevantRating.dimensions, 'Practical Contribution', ratee.ID, rater.ID),
            workEthic: findDimensionRating(relevantRating.dimensions, 'Work Ethic', ratee.ID, rater.ID)
        };

        // Calculate average
        const validRatings = Object.values(ratings).filter(r => r !== 'N/A' && !isNaN(r));
        ratings.average = validRatings.length > 0 
            ? (validRatings.reduce((acc, val) => acc + parseFloat(val), 0) / validRatings.length).toFixed(1)
            : 'N/A';

        return ratings;
    };

    const findDimensionRating = (dimensions, dimensionName, rateeId, raterId) => {
        try {
            // Find the dimension
            const dimension = dimensions?.find(d => d.dimensionName === dimensionName);
            if (!dimension || !dimension.groupRatings) return 'N/A';
            
            // Find the rating where raterId matches the raterID field
            // and rateeId matches the _id field (which is the student being rated)
            const rating = dimension.groupRatings.find(r => {
                return r.raterID === raterId;
            });
            
            return rating ? rating.ratingValue : 'N/A';
        } catch (error) {
            console.error('Error finding dimension rating:', error);
            return 'N/A';
        }
    };

    const TeamRatingsTable = ({ students, groupID }) => (
        <div style={{ marginBottom: '30px', overflowX: 'auto' }}>
            <h3 style={{ marginBottom: '10px' }}>Individual Ratings Within Team</h3>
            <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Rater → Ratee</th>
                        <th style={{ border: '1px solid black', padding: '8px' }}>Dimension</th>
                        {students.map(student => (
                            <th key={student.ID} style={{ border: '1px solid black', padding: '8px' }}>
                                {student.FirstName} {student.LastName}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {students.map(rater => (
                        <>
                            <tr key={`${rater.ID}-cooperation`}>
                                <td rowSpan="5" style={{ border: '1px solid black', padding: '8px' }}>
                                    {rater.FirstName} {rater.LastName}
                                </td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>Cooperation</td>
                                {students.map(ratee => {
                                    const ratings = getTeamMemberRatings(rater, ratee, groupID);
                                    return (
                                        <td key={`${rater.ID}-${ratee.ID}-coop`} 
                                            style={{ border: '1px solid black', padding: '8px' }}>
                                            {rater.ID === ratee.ID ? '-' : ratings?.cooperation || 'N/A'}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr key={`${rater.ID}-conceptual`}>
                                <td style={{ border: '1px solid black', padding: '8px' }}>Conceptual</td>
                                {students.map(ratee => {
                                    const ratings = getTeamMemberRatings(rater, ratee, groupID);
                                    return (
                                        <td key={`${rater.ID}-${ratee.ID}-concept`}
                                            style={{ border: '1px solid black', padding: '8px' }}>
                                            {rater.ID === ratee.ID ? '-' : ratings?.conceptual || 'N/A'}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr key={`${rater.ID}-practical`}>
                                <td style={{ border: '1px solid black', padding: '8px' }}>Practical</td>
                                {students.map(ratee => {
                                    const ratings = getTeamMemberRatings(rater, ratee, groupID);
                                    return (
                                        <td key={`${rater.ID}-${ratee.ID}-practical`}
                                            style={{ border: '1px solid black', padding: '8px' }}>
                                            {rater.ID === ratee.ID ? '-' : ratings?.practical || 'N/A'}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr key={`${rater.ID}-workethic`}>
                                <td style={{ border: '1px solid black', padding: '8px' }}>Work Ethic</td>
                                {students.map(ratee => {
                                    const ratings = getTeamMemberRatings(rater, ratee, groupID);
                                    return (
                                        <td key={`${rater.ID}-${ratee.ID}-workethic`}
                                            style={{ border: '1px solid black', padding: '8px' }}>
                                            {rater.ID === ratee.ID ? '-' : ratings?.workEthic || 'N/A'}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr key={`${rater.ID}-average`}>
                                <td style={{ 
                                    border: '1px solid black', 
                                    padding: '8px',
                                    backgroundColor: '#f0f0f0',
                                    fontWeight: 'bold'
                                }}>
                                    Average
                                </td>
                                {students.map(ratee => {
                                    const ratings = getTeamMemberRatings(rater, ratee, groupID);
                                    return (
                                        <td key={`${rater.ID}-${ratee.ID}-average`}
                                            style={{ 
                                                border: '1px solid black', 
                                                padding: '8px',
                                                backgroundColor: '#f0f0f0',
                                                fontWeight: 'bold'
                                            }}>
                                            {rater.ID === ratee.ID ? '-' : ratings?.average || 'N/A'}
                                        </td>
                                    );
                                })}
                            </tr>
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const getDimensionRating = (student, dimensionName, classID) => {
        const ratings = [];
        student.Ratings?.forEach(rating => {
            if (rating.classID === classID) {
                const dimension = rating.dimensions?.find(d => d.dimensionName === dimensionName);
                if (dimension?.groupRatings) {
                    dimension.groupRatings.forEach(groupRating => {
                        if (groupRating.ratingValue) {
                            ratings.push(parseInt(groupRating.ratingValue));
                        }
                    });
                }
            }
        });
        return ratings.length > 0 ? calculateAverage(ratings) : 'No Rating';
    };

    const calculateStudentAverage = (cooperation, conceptualContribution, practicalContribution, workEthic) => {
        const ratings = [cooperation, conceptualContribution, practicalContribution, workEthic].filter(
            rating => rating !== 'No Rating' && !isNaN(rating)
        );
        return ratings.length > 0 ? (ratings.reduce((acc, val) => acc + parseFloat(val), 0) / ratings.length).toFixed(1) : 'N/A';
    };

    const calculateAverage = (arr) => {
        return (arr.reduce((acc, val) => acc + val, 0) / arr.length).toFixed(1);
    };

    if (loading) return <div>Loading data...</div>;
    if (error) return <div>{error}</div>;
    if (!students.length) return <div>No students found for this class.</div>;

    return (
        <div className="manage-groups-container" style={{ display: 'flex' }}>
            <InstructorSidebar />
            <div style={{ padding: '20px', width: '100%' }}>
                <h1 style={{ marginBottom: '20px' }}><b>Detailed View for class {classID}</b></h1>
                
                {Object.entries(teamGroups).map(([groupID, groupStudents]) => {
                    // Debug logging to help see the data structure
                    console.log('Group:', groupID, 'Students:', groupStudents);
                    return (
                        <div key={groupID} style={{ marginBottom: '30px' }}>
                            <h2 style={{ marginBottom: '10px' }}>
                                {groupID === 'ungrouped' 
                                    ? 'Ungrouped Students' 
                                    : `Team ${groupDetails[groupID] || groupID}`}
                            </h2>
                            {groupID !== 'ungrouped' && (
                                <>
                                    {/* Debug */}
                                    <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                                        Debug - Number of students: {groupStudents.length}
                                    </div>
                                    <TeamRatingsTable students={groupStudents} groupID={groupID} />
                                </>
                            )}
                        </div>
                    );
                })}
                
                {/* Debug section to show raw data */}
                <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
                    <h3>Debug Information</h3>
                    <pre style={{ fontSize: '12px' }}>
                        {JSON.stringify({ students: students.slice(0, 1) }, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default DetailedViewPage;