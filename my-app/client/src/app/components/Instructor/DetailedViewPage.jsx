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
            
            //debug
            console.log('API Response:', response.data);
            console.log('Group Details:', response.data.groupDetails);
            console.log('Student Summary:', response.data.studentSummary);
            
            setGroupDetails(response.data.groupDetails || []);
            setStudents(response.data.studentSummary || []);
            
            // Organize students by teams
            const groups = {};
            response.data.studentSummary.forEach(student => {
                console.log(`Processing student ${student.FirstName} ${student.LastName}:`, {
                    Groups: student.Groups,
                    Ratings: student.Ratings
                });

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

            console.log('Organized team groups:', groups);
            setTeamGroups(groups);
        } catch (error) {
            console.error('Error in fetchStudents:', error);
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
    
    const getRaterToRateeInfo = (rater, ratee, dimensionName) => {
        try {
            // Find the rating object for this specific class
            const relevantRating = rater.Ratings?.find(rating => 
                rating.classID === parseInt(classID)
            );

            if (!relevantRating) return { rating: 'No Rating', comment: '' };

            // Find the specific dimension
            const dimension = relevantRating.dimensions?.find(d => 
                d.dimensionName === dimensionName
            );

            if (!dimension || !dimension.groupRatings) return { rating: 'No Rating', comment: '' };

            // Find the specific rating where rater rates ratee
            const groupRating = dimension.groupRatings.find(r => 
                r.raterID === ratee.ID
            );

            if (!groupRating) return { rating: 'No Rating', comment: '' };

            return {
                rating: groupRating.ratingValue || 'No Rating',
                comment: groupRating.comments || ''
            };
        } catch (error) {
            console.error('Error getting rating:', error);
            return { rating: 'No Rating', comment: '' };
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
                        <React.Fragment key={rater.ID}>
                            <tr>
                                <td rowSpan="5" style={{ border: '1px solid black', padding: '8px' }}>
                                    {rater.FirstName} {rater.LastName}
                                </td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>Cooperation</td>
                                {students.map(ratee => {
                                    const { rating, comment } = getRaterToRateeInfo(rater, ratee, 'Cooperation');
                                    return (
                                        <td key={`${rater.ID}-${ratee.ID}-coop`} 
                                            style={{ border: '1px solid black', padding: '8px' }}>
                                            {rater.ID === ratee.ID ? '-' : (
                                                <div>
                                                    <div>{rating}</div>
                                                    {comment && <div style={{ fontSize: '0.8em', color: '#666' }}>"{comment}"</div>}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid black', padding: '8px' }}>Conceptual</td>
                                {students.map(ratee => {
                                    const { rating, comment } = getRaterToRateeInfo(rater, ratee, 'Conceptual Contribution');
                                    return (
                                        <td key={`${rater.ID}-${ratee.ID}-concept`}
                                            style={{ border: '1px solid black', padding: '8px' }}>
                                            {rater.ID === ratee.ID ? '-' : (
                                                <div>
                                                    <div>{rating}</div>
                                                    {comment && <div style={{ fontSize: '0.8em', color: '#666' }}>"{comment}"</div>}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid black', padding: '8px' }}>Practical</td>
                                {students.map(ratee => {
                                    const { rating, comment } = getRaterToRateeInfo(rater, ratee, 'Practical Contribution');
                                    return (
                                        <td key={`${rater.ID}-${ratee.ID}-practical`}
                                            style={{ border: '1px solid black', padding: '8px' }}>
                                            {rater.ID === ratee.ID ? '-' : (
                                                <div>
                                                    <div>{rating}</div>
                                                    {comment && <div style={{ fontSize: '0.8em', color: '#666' }}>"{comment}"</div>}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid black', padding: '8px' }}>Work Ethic</td>
                                {students.map(ratee => {
                                    const { rating, comment } = getRaterToRateeInfo(rater, ratee, 'Work Ethic');
                                    return (
                                        <td key={`${rater.ID}-${ratee.ID}-workethic`}
                                            style={{ border: '1px solid black', padding: '8px' }}>
                                            {rater.ID === ratee.ID ? '-' : (
                                                <div>
                                                    <div>{rating}</div>
                                                    {comment && <div style={{ fontSize: '0.8em', color: '#666' }}>"{comment}"</div>}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                            <tr>
                                <td style={{ 
                                    border: '1px solid black', 
                                    padding: '8px',
                                    backgroundColor: '#f0f0f0',
                                    fontWeight: 'bold'
                                }}>
                                    Average
                                </td>
                                {students.map(ratee => {
                                    const dimensions = [
                                        getRaterToRateeInfo(rater, ratee, 'Cooperation').rating,
                                        getRaterToRateeInfo(rater, ratee, 'Conceptual Contribution').rating,
                                        getRaterToRateeInfo(rater, ratee, 'Practical Contribution').rating,
                                        getRaterToRateeInfo(rater, ratee, 'Work Ethic').rating
                                    ];
                                    
                                    const validRatings = dimensions.filter(r => r !== 'No Rating' && !isNaN(r));
                                    const average = validRatings.length > 0 
                                        ? (validRatings.reduce((acc, val) => acc + parseFloat(val), 0) / validRatings.length).toFixed(1)
                                        : 'N/A';

                                    return (
                                        <td key={`${rater.ID}-${ratee.ID}-average`}
                                            style={{ 
                                                border: '1px solid black', 
                                                padding: '8px',
                                                backgroundColor: '#f0f0f0',
                                                fontWeight: 'bold'
                                            }}>
                                            {rater.ID === ratee.ID ? '-' : average}
                                        </td>
                                    );
                                })}
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );

    if (loading) return <div>Loading data...</div>;
    if (error) return <div>{error}</div>;
    if (!students.length) return <div>No students found for this class.</div>;

    return (
        <div className="manage-groups-container" style={{ display: 'flex' }}>
            <InstructorSidebar />
            <div style={{ padding: '20px', width: '100%' }}>
                <h1 style={{ marginBottom: '20px' }}><b>Detailed View for class {classID}</b></h1>
                
                {Object.entries(teamGroups).map(([groupID, groupStudents]) => (
                    <div key={groupID} style={{ marginBottom: '30px' }}>
                        <h2 style={{ marginBottom: '10px' }}>
                            {groupID === 'ungrouped' 
                                ? 'Ungrouped Students' 
                                : `Team ${groupDetails[groupID] || groupID}`}
                        </h2>
                        {groupID !== 'ungrouped' && (
                            <>
                                <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                                    Number of students: {groupStudents.length}
                                </div>
                                <TeamRatingsTable students={groupStudents} groupID={groupID} />
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DetailedViewPage;