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

    const handleRateClick = (student) => {
        navigate(`/studentRatePage?studentId=${student.id}`, { state: { student, classID } }); // Navigate to the rate page with studentId as a query parameter
    };

    const handleReviewClick = (student) => {
    };

    return (
        <div className="manage-groups-container" style={{ display: 'flex' }}>
            <StudentSidebar />
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <div className="
                w-full 
                bg-emerald-500 
                text-white 
                py-10 
                text-center 
                rounded-md 
                mb-4">
                    <h2 className="
                    text-3xl 
                    font-bold
                    ">Groups for Class {classID}</h2>
                </div>
                {groups.length > 0 ? (
                    <div className="
                    grid 
                    grid-cols-4 
                    gap-4">
                        <div className="
                        group-tile 
                        p-4 
                        rounded-md 
                        bg-gray-200">
                            <div className="
                            bg-emerald-500 
                            text-white 
                            p-4 
                            rounded-md 
                            mb-4">
                                <h3 className="
                                text-xl 
                                font-bold 
                                text-center">{groups[0].name}</h3>
                                <p className="text-center">Group ID: {groups[0].id}</p>
                            </div>
                            <ul className="flex flex-col">
                                {groups[0].groupMembers.map((student) => {
                                    const hasRated = ratedStudents[classID]?.includes(student.id);
                                    return (
                                        <li key={student.id} className={`p-2 rounded-md w-full ${hasRated ? 'bg-green-100' : ''}`}>
                                            <div className="flex justify-between items-center">
                                                <span>{student.name} (ID: {student.id})</span>
                                                {student.id !== userID && (
                                                    hasRated ? (
                                                        <span className="ml-2 text-green-600">Rated ✔</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleRateClick(student)}
                                                            className="
                                                            ml-2 
                                                            bg-blue-500 
                                                            text-white 
                                                            py-1 
                                                            px-3 
                                                            rounded 
                                                            hover:bg-blue-700 
                                                            transition-colors 
                                                            duration-300"
                                                        >
                                                            Rate
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        {groups.slice(1).map((group) => (
                            <div key={group.id} className="
                            group-tile 
                            p-4 rounded-md 
                            bg-gray-200">
                                <div className="
                                bg-gray-300 
                                text-black 
                                p-4 
                                rounded-md 
                                mb-4">
                                    <h4 className="
                                    text-lg 
                                    font-bold 
                                    text-center">{group.name}</h4>
                                    <p className="text-center">Group ID: {group.id}</p>
                                </div>
                                <ul className="flex flex-col">
                                    {group.groupMembers.map((student) => (
                                        <li key={student.id} className="
                                        p-2 
                                        rounded-md 
                                        w-full">
                                            {student.name} (ID: {student.id})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>{message}</p>
                )}
                <hr className="
                my-8 
                border-t-2 
                border-gray-300" />
                <div className="
                ungrouped-students-box 
                bg-gray-200 
                p-4 
                rounded-md 
                mt-4">
                    <h3 className="
                    text-xl 
                    font-bold 
                    mb-3 
                    text-center">Students Not in a Group</h3>
                    <div className="
                    grid 
                    grid-cols-4 
                    gap-4">
                        {ungroupedStudents.length > 0 ? (
                            ungroupedStudents.map(student => (
                                <div key={student.id} className="p-2 rounded-md">
                                    {student.name} (ID: {student.id})
                                </div>
                            ))
                        ) : (
                            <p>All students have been assigned to groups.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentManageGroups;