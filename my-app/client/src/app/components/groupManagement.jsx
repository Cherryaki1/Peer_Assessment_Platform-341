// src/app/components/GroupManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GroupManagement = () => {
    const [groups, setGroups] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [studentIDs, setStudentIDs] = useState([]);
    const [classID, setClassID] = useState(''); // This should be set to the current class ID

    const fetchGroups = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/groups/${classID}`, {
                withCredentials: true
            });
            setGroups(response.data.groups);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/createGroup', {
                groupName,
                classID,
                studentIDs
            }, { withCredentials: true });

            alert(response.data.message);
            fetchGroups(); // Refresh the list of groups
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    useEffect(() => {
        if (classID) fetchGroups();
    }, [classID]);

    return (
        <div>
            <h2>Group Management</h2>
            <form onSubmit={handleCreateGroup}>
                <input
                    type="text"
                    placeholder="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Class ID"
                    value={classID}
                    onChange={(e) => setClassID(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Student IDs (comma-separated)"
                    value={studentIDs.join(',')}
                    onChange={(e) => setStudentIDs(e.target.value.split(',').map(id => id.trim()))}
                />
                <button type="submit">Create Group</button>
            </form>

            <h3>Existing Groups</h3>
            <ul>
                {groups.map(group => (
                    <li key={group._id}>{group.groupName} - Students: {group.students.join(', ')}</li>
                ))}
            </ul>
        </div>
    );
};

export default GroupManagement;

