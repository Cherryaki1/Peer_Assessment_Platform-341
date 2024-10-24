import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; //get class ID from URL
import StudentSidebar from './StudentSidebar';
import { FaStar } from 'react-icons/fa'; 

const StudentManageGroups = () => {

    const { classID } = useParams();  // Get the classID from the URL
    const [groups, setGroups] = useState([]); // To store the fetched groups
    const [ungroupedStudents, setUngroupedStudents] = useState([]);  // To store ungrouped students
    const [studentID, setStudentID] = useState(null); //store student ID
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    // Store ratings and hover states per student
    const [studentRatings, setStudentRatings] = useState({});  // For student ratings
    const [hoverRatings, setHoverRatings] = useState({});  // For student hover ratings

    // Fetch the groups and students for the given class
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch the logged-in user data (student)
                const response = await axios.get('http://localhost:3000/index', {
                    withCredentials: true,
                });
                
                if (response.data.user && response.data.user.ID) {
                    setStudentID(response.data.user.ID); // Store the student's ID
                } else {
                    setMessage('Failed to retrieve students data.');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setMessage('Error fetching user data.');
            }
        };

        const fetchGroups = async () => {
            console.log(`Fetching groups for classID: ${classID}`); 
            try {
                const response = await axios.get(`http://localhost:3000/studentManageGroups/${classID}`, {
                    withCredentials: true,  
                });
                
                setGroups(response.data.groups);  // Set groups
                setUngroupedStudents(response.data.ungroupedStudents);  // Set ungrouped students
                if (response.data.groups.length === 0) {
                    setMessage('No groups available for this class.');
                } else {
                    setMessage('');
                }
            } catch (error) {
                console.error('Error fetching groups:', error);
                setMessage('Failed to fetch groups.');
            } finally {
                setLoading(false);  // Always stop loading after the request
            }
        };

        fetchUserData();
        fetchGroups();  // Fetch groups when component mounts
    }, [classID]);  // Re-fetch if classID changes

    if (loading) {
        return <div>Loading groups...</div>;  // Show loading state while fetching data
    }

    // Handle rating change for a specific student
    const handleRating = (studentId, rating) => {
        setStudentRatings(prevRatings => ({
            ...prevRatings,
            [studentId]: rating,  // Set rating for the specific student
        }));
    };

    // Handle hover change for a specific student
    const handleHover = (studentId, hoverValue) => {
        setHoverRatings(prevHovers => ({
            ...prevHovers,
            [studentId]: hoverValue,  // Set hover state for the specific student
        }));
    };

    return (
        <div className="manage-groups-container" style={{ display: 'flex' }}>
            <StudentSidebar />
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <h2>My Group for Class: {classID}</h2>
                {groups.length > 0 ? (
                    <ul>
                        {groups.map((group) => (
                            <li key={group.id}>
                                <h3>{group.name}</h3>  {/* Display group name */}
                                <p>Group ID: {group.id}</p>
                                <h4>Members:</h4>
                                <ul>
                                    {group.groupMembers.map((student) => (
                                        <li key={student.id}>
                                            {student.name} (ID: {student.id})
                                            {[...Array(5)].map((star, index) => {
                                                const currentRating = index + 1;
                                                return (
                                                    <label key={`${student.id}-star-${index}`}>
                                                        <input 
                                                            type="radio" 
                                                            name={`rating-${student.id}`}  // Unique name for each student
                                                            value={currentRating}
                                                            onClick={() => handleRating(student.id, currentRating)}
                                                        />
                                                        <FaStar 
                                                            className='star'
                                                            size={25} 
                                                            color={currentRating <= (hoverRatings[student.id] || studentRatings[student.id]) ? "#ffc107" : "#e4e5e9"}
                                                            onMouseEnter={() => handleHover(student.id, currentRating)}
                                                            onMouseLeave={() => handleHover(student.id, null)}
                                                        />
                                                    </label>
                                                );
                                            })}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>{message}</p>  // Display message if no groups are available
                )}

                <h2>Students Not in a Group</h2>
                <ul>
                    {ungroupedStudents.length > 0 ? (
                        ungroupedStudents.map(student => (
                            <li key={student.id}>
                                {student.name} (ID: {student.id})
                            </li>
                        ))
                    ) : (
                        <p>All students have been assigned to groups.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default StudentManageGroups;