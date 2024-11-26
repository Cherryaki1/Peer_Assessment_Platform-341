import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // To get classID from the URL
import Sidebar from '../_InstructorSidebar'; // Assuming Sidebar is used here as well

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
            <Sidebar />
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <div
                    className="w-full bg-blue-500 text-white py-10 text-center rounded-md mb-4"
                >
                    <h1 className="text-3xl font-bold">Manage Groups for Class {classID}</h1>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-100 rounded-md shadow-md">
                        <h2 className="text-xl font-bold mb-2">Groups</h2>
                        {groups.length > 0 ? (
                            groups.map((group) => (
                                <div key={group.id} className="mb-4">
                                    <h3 className="text-lg font-semibold">{group.name}</h3>
                                    <p>Group ID: {group.id}</p>
                                    <h4 className="font-semibold">Members:</h4>
                                    <ul className="list-disc pl-5">
                                        {group.groupMembers.map((student) => (
                                            <li key={student.id}>
                                                {student.name} (ID: {student.id})
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={() => handleAddStudentsToGroup(group.id)}
                                        className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-md"
                                    >
                                        Add Students
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>{message}</p>
                        )}
                    </div>

                    <div className="p-4 bg-gray-100 rounded-md shadow-md">
                        <h2 className="text-xl font-bold mb-2">Students Not in a Group</h2>
                        <ul>
                            {ungroupedStudents.length > 0 ? (
                                ungroupedStudents.map((student) => (
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

                <div className="mt-6 p-4 bg-gray-100 rounded-md shadow-md">
                    <h2 className="text-xl font-bold mb-2">Create a New Group</h2>
                    <form onSubmit={handleCreateGroup} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Group Name"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Student IDs (comma-separated)"
                            value={newStudentIDs.join(',')}
                            onChange={(e) => setNewStudentIDs(e.target.value.split(',').map((id) => id.trim()))}
                            className="w-full p-2 border rounded-md"
                        />
                        <input
                            type="text"
                            placeholder="Group ID"
                            value={newGroupID}
                            onChange={(e) => setNewGroupID(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        />
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
                            Create Group
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InstructorManageGroups;
