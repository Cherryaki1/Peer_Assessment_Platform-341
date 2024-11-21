import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StudentSidebar from '../_StudentSidebar';
import { useParams, useNavigate } from 'react-router-dom'; //get class ID from URL

const StudentManageGroups = () => {

    const { classID } = useParams();  // Get the classID from the URL
    const [groups, setGroups] = useState([]); // To store the fetched groups
    const [ungroupedStudents, setUngroupedStudents] = useState([]);  // To store ungrouped students
    const [userID, setUserID] = useState(null); //store student ID
    const [ratedStudents, setRatedStudents] = useState([]); //store the students that the logged-in student has rated
    const [groupID, setGroupID] = useState([]);//store the groups of the logged-in student
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Initialize useNavigate

    // Fetch the groups and students for the given class
    useEffect(() => {
        fetchUserData();
        fetchGroups();  // Fetch groups when component mounts
    }, [classID]);  // Re-fetch if classID changes

    const fetchUserData = async () => {
        try {
            // Fetch the logged-in user data (student)
            const response = await axios.get('http://localhost:3000/index', {
                withCredentials: true,
            });
            
            if (response.data.user && response.data.user.ID) {
                const userID = response.data.user.ID;
                setUserID(userID); // Store the student's ID
                await fetchStudentFromUser(userID,);
                await fetchRatedStudents(userID, classID);
            } else {
                setMessage('Failed to retrieve students data.');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setMessage('Error fetching user data.');
        }
    };

    const fetchStudentFromUser = async (userID) => {
        try {
            const response = await axios.get('http://localhost:3000/studentFromUser', {
                withCredentials: true,
            });

            if (response.data.student && response.data.student.Groups) {
                console.log("Setting groupID:", response.data.student.Groups);
                setGroupID(response.data.student.Groups); // Set the student's group ID
            } else {
                setMessage('Student not found or no group data available.');
            }
        } catch (error) {
            console.error('Error fetching student from user:', error);
            setMessage('Error fetching student data.');
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

    const fetchRatedStudents = async (userID, classID) => {
        try {
            const response = await axios.get(`http://localhost:3000/hasRated`, { params: { userID, classID } });
            const ratedStudentsIds = response.data[classID] || [];

            setRatedStudents(prevRatedStudents => ({
                ...prevRatedStudents,
                [classID]: ratedStudentsIds  // Update the map with classID as key
            }));
        } catch (error) {
            console.error("Error fetching rated students:", error);
        }
    };

    // Function to handle navigation to the rate page
    const handleRateClick = (student) => {
        navigate(`/studentRatePage?studentId=${student.id}`, { state: { student, classID } }); // Navigate to the rate page with studentId as a query parameter
    };

    const handleReviewClick = (student) => {
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
                                <h3>{group.name}</h3>
                                <p>Group ID: {group.id}</p>
                                <h4>Members:</h4>
                                <ul>
                                    {group.groupMembers.map((student) => {
                                        const hasRated = ratedStudents[classID]?.includes(student.id);
                                        console.log("ratedStudents:", ratedStudents);
                                        console.log("hasRated:", hasRated);
                                        return (
                                            <li key={student.id}>
                                                {student.name} (ID: {student.id})
                                                {Array.isArray(groupID) &&
                                                    student.id !== userID &&
                                                    groupID.includes(Number(group.id)) && (
                                                        <>
                                                            {hasRated ? (
                                                                <span
                                                                    style={{ marginLeft: '10px', color: 'green' }}>
                                                                    Rated ✔
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleRateClick(student)}
                                                                    style={{ marginLeft: '10px' }}>
                                                                    Rate
                                                                </button>
                                                            )}
                                                        </>
                                                )}
                                            </li>
                                        );
                                    })}
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