import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // To get classID from the URL
import Sidebar from './Sidebar'; // Assuming Sidebar is used here as well

const InstructorManageGroups = () => {
    const { classID } = useParams();  // Get the classID from the URL
    const [groups, setGroups] = useState([]); // To store the fetched groups
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true); // Loading state

    // Fetch the groups and students for the given class
    useEffect(() => {
        const fetchGroups = async () => {
            console.log(`Fetching groups for classID: ${classID}`); 
            try {
                const response = await axios.get(`http://localhost:3000/instructorManageGroups/${classID}`, {
                    withCredentials: true,  
                });
                
                setGroups(response.data.groups);  // Assuming groups are returned
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

        fetchGroups();  // Fetch groups when component mounts
    }, [classID]);  // Re-fetch if classID changes

    if (loading) {
        return <div>Loading groups...</div>;  // Show loading state while fetching data
    }

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
            </div>
        </div>
    );
};

export default InstructorManageGroups;
