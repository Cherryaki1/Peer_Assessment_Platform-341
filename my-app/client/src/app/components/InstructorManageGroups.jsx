import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

const InstructorManageGroups = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState([]);
    //const [newGroupName, setNewGroupName] = useState('');
    //const [newGroupID, setNewGroupID] = useState('');
    const [classData, setClassData] = useState(null);


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost:3000/index', {
                    withCredentials: true
                });
                setUser(response.data.user);
                setMessage(response.data.message);
            } catch (error) {
                setMessage(error.response?.data?.message || 'Failed to fetch user');
            } finally {
                setLoading(false); // Always stop loading regardless of success/failure
            }
        };

        const fetchGroups = async () => {
            try{
                const response = await axios.get('http://localhost:3000/instructorManageClasses', {
                    withCredentials: true,
                });
                setGroups(response.data.groups);
                if(response.data.groups.length === 0){
                    setMessage('You are not in any groups.');
                }else{
                    setMessage('');
                }
            }
            catch(error){
                console.error('Error fetching groups:', error);
                if(error.response){
                    setMessage(`Error: ${error.response.data.message || 'Failed to fetch groups.'}`);
                } else if (error.request) {
                    setMessage('No response from server. Check if the server is running.');
                } else {
                    setMessage('Error setting up the request.');
                }
            }
        }
        const fetchClassData = async () => {
            try {
              const response = await axios.get('http://localhost:3000/instructorManageGroups', {withCredentials: true,}); // API call to the backend
              setClassData(response.data);
              setLoading(false);
            } catch (err) {
              console.error('Error fetching class data');
              setLoading(false);
            }
        };
      
        fetchClassData();
        fetchGroups();
    },);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="manage-classes-container" style={{ display: 'flex' }}>
            <Sidebar /> {/* Include Sidebar component */}
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                {user ? (
                    <div>
                        <h2>{message}</h2>
                        <h2 style={{textAlign:'center'}}>Welcome Professor, {user.FirstName}!</h2>
                        <div className='view-groups'>
                            {groups.length > 0 ?(
                                <ul>
                                    {groups.map((groupItem, index) => (
                                        <li key={index}>
                                            <strong>{groupItem.name}</strong>,
                                        </li>
                                    ))}
                                </ul>

                            ) : (
                                <p>{message}</p> //displays message if no class
                            )}
                            <div className='view-classes-and-groups'>
                                {{/*this isn't working but maybe we should make the manage classes list a button so that when
                                    you click on it it brings you to the manage groups page instead of having a manage groups
                                    page on the sidebar. that way itll only show the groups for that class}}
                                <h1>{classItem.Name}</h1>
                                <h2>Class ID: {classItem.ID}</h2>
                
                                {List all students in the class }
                                <h3>Students in Class:</h3>
                                    <ul>
                                        {classes.students.map((student) => (
                                        <li key={student.ID}>
                                        {student.LastName}, {student.FirstName} (ID: {student.studentID})
                                        </li>
                                        ))}
                                    </ul>
                
                                {/* List all groups }
                                <h3>Groups:</h3>
                                    {classes.groups.map((group) => (
                                    <div key={group.ID} style={{ marginBottom: '20px' }}>
                                        <h4>{groupItem.GroupName}</h4>
                                            <p>Group ID: {group.ID}</p>
                                            <ul>
                                                {groupItem.students.map((student) => (
                                                    <li key={student.ID}>
                                                        {student.LastName},{student.FirstName} (ID: {student.ID})
                                                    </li>
                                                ))}
                                            </ul>
                                    </div>
                                    ))}*/}}
                            </div>
                        </div>



                        <div className='manage-groups'>
                            {{/*code to add and remove students from goups*/}}
                        </div>


                    </div>
                ) : (
                    <p>{message}</p>
                )}
            </div>
        </div>
    );
};

export default InstructorManageGroups;
