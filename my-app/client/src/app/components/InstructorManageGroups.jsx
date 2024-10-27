import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // To get classID from the URL
import Sidebar from './Sidebar'; // Assuming Sidebar is used here as well

const InstructorManageGroups = () => {
    const { classID } = useParams();  // Get the classID from the URL
    const [groups, setGroups] = useState([]); // To store the fetched groups
    const [ungroupedStudents, setUngroupedStudents] = useState([]);  // To store ungrouped students
    const [newGroupName, setNewGroupName] = useState('');
    const [newStudentIDs, setNewStudentIDs] = useState([]); // List of student IDs for new group
    const [newGroupID, setNewGroupID] = useState('');
    const [instructorID, setInstructorID] = useState(null); // Store instructor's ID
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true); // Loading state

    // Fetch the groups and students for the given class
    const fetchUserData = async () => {
        try {
            // Fetch the logged-in user data (instructor)
            const response = await axios.get('http://localhost:3000/index', {
                withCredentials: true,
            });
            
            if (response.data.user && response.data.user.ID) {
                setInstructorID(response.data.user.ID); // Store the instructor's ID
            } else {
                setMessage('Failed to retrieve instructor data.');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setMessage('Error fetching user data.');
        }
    };

    const fetchGroups = async () => {
        console.log(`Fetching groups for classID: ${classID}`); 
        try {
            const response = await axios.get(`http://localhost:3000/instructorManageGroups/${classID}`, {
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
    
    useEffect(() =>{
        fetchUserData();
        fetchGroups();  // Fetch groups when component mounts
    }, [classID]);  // Re-fetch if classID changes

    if (loading) {
        return <div>Loading groups...</div>;  // Show loading state while fetching data
    }

    // Handle creating a new group
    const handleCreateGroup = async () => {
        try {
            const response = await axios.post('http://localhost:3000/createGroup', {
                newGroupName,
                classID,  // No need to input, this is passed directly
                instructorID,
                newStudentIDs,
                newGroupID
            }, { withCredentials: true });

            alert(response.data.message);
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };
    
    const handleAddStudentsToGroup = async (groupID) => {
        const studentIDsToAdd = prompt("Enter Student IDs to add (comma-separated):");
        if (studentIDsToAdd) {
            const ids = studentIDsToAdd.split(',').map(id => id.trim());
            try {
                const response = await axios.post('http://localhost:3000/addStudentsToGroup', {
                    groupID,
                    studentIDs: ids,
                    instructorID
                }, { withCredentials: true });

                alert(response.data.message);
                // Refresh the groups after adding students
                fetchGroups();
            } catch (error) {
                console.error('Error adding students to group:', error);
            }
        }
    };

    // handle removing students grom a group
    const handleRemoveStudentFromGroup = async (groupID, studentID) => {
        const confirmation = window.confirm(`Are you sure you want to remove this student (ID: ${studentID}) from the group?`);
        if (confirmation) {
            try {
                const response = await axios.post('http://localhost:3000/removeStudentFromGroup', {
                    groupID,
                    studentID,
                    instructorID
                }, { withCredentials: true });

                alert(response.data.message);
                // Refresh the groups after removing a student
                fetchGroups();
            } catch (error) {
                console.error('Error removing student from group:', error);
            }
        }
    };


    return (
        <div className="manage-groups-container" style={{ display: 'flex' }}>
            <Sidebar /> {/* Include Sidebar if it's part of your layout */}
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <h2>Manage Groups for Class {classID}</h2>
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

                <h2>Create a New Group</h2>
                <form onSubmit={handleCreateGroup}>
                    <input
                        type="text"
                        placeholder="Group Name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        required
                    />
                    <br />
                    <input
                        type="text"
                        placeholder="Student IDs (comma-separated)"
                        value={newStudentIDs.join(',')}
                        onChange={(e) => setNewStudentIDs(e.target.value.split(',').map(id => id.trim()))}
                    />
                    <br />
                    <input
                        type="text"
                        placeholder="Enter Group ID"
                        value={newGroupID}
                        onChange={(e) => setNewGroupID(e.target.value)}
                    />
                    <button type="submit">Create Group</button>
                </form>
            </div>
        </div>
    );
};

export default InstructorManageGroups;

