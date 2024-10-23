import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; //get class ID from URL
import StudentSidebar from './StudentSidebar'; 

const StudentManageGroups = () => {

    const { classID } = useParams();  // Get the classID from the URL
    const [groups, setGroups] = useState([]); // To store the fetched groups
    const [ungroupedStudents, setUngroupedStudents] = useState([]);  // To store ungrouped students
    const [studentID, setStudentID] = useState(null); //store student ID
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

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