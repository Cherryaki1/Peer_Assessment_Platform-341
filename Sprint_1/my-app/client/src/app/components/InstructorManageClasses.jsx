// InstructorManageClasses.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';

const InstructorManageClasses = () => {
    const [classes, setClasses] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newClassName, setNewClassName] = useState('');
    const [newClassSubject, setNewClassSubject] = useState('');
    const [newClassSection, setNewClassSection] = useState('');
    const [newClassID, setNewClassID] = useState('');
    const [message, setMessage] = useState('');
    const [instructorID, setInstructorID] = useState(null); // New state to store instructor's ID

    // Fetch current classes and instructor details when the component mounts
    useEffect(() => {
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

        const fetchClasses = async () => {
            try {
                const response = await axios.get('http://localhost:3000/instructorManageClasses', {
                    withCredentials: true,
                });
                setClasses(response.data.classes);
                if (response.data.classes.length === 0) {
                    setMessage('No classes are available (None added).');
                } else {
                    setMessage(''); // Clear the message if there are classes
                }
            } catch (error) {
                console.error('Error fetching classes:', error);

                if (error.response) {
                    setMessage(`Error: ${error.response.data.message || 'Failed to fetch classes.'}`);
                } else if (error.request) {
                    setMessage('No response from server. Check if the server is running.');
                } else {
                    setMessage('Error setting up the request.');
                }
            }
        };

        fetchUserData(); // Fetch the instructor's information
        fetchClasses();  // Fetch the list of classes
    }, []);

    // Handle file selection for the new class roster
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    // Upload the CSV file to create a new class
    const handleUpload = async () => {
        if (!selectedFile || !newClassName.trim() || !newClassSubject.trim() || !newClassSection.trim() || !newClassID.trim() || !instructorID) {
            setMessage('Please provide all class details and select a file.');
            return;
        }

        const formData = new FormData();
        formData.append('roster', selectedFile);
        formData.append('className', newClassName.trim());
        formData.append('subject', newClassSubject.trim());
        formData.append('section', newClassSection.trim());
        formData.append('classID', newClassID.trim());
        formData.append('instructorID', instructorID); // Use the logged-in instructor's ID

        try {
            const response = await axios.post('http://localhost:3000/uploadClass', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            setMessage(response.data.message);
            setClasses([...classes, {
                name: newClassName.trim(),
                subject: newClassSubject.trim(),
                section: newClassSection.trim(),
                studentCount: response.data.studentCount,
                groupCount: response.data.groupCount
            }]);

            // Clear form fields after a successful upload
            setNewClassName('');
            setNewClassSubject('');
            setNewClassSection('');
            setNewClassID('');
            setSelectedFile(null);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to upload roster');
        }
    };

    return (
        <div className="manage-classes-container" style={{ display: 'flex' }}>
            <Sidebar /> {/* Include Sidebar component */}
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <h2>Manage Classes</h2>
                {/* Display current classes */}
                <div>
                    <h3>Current Classes</h3>
                    {classes.length > 0 ? (
                        <ul>
                            {classes.map((classItem, index) => (
                                <li key={index}>
                                    <strong>{classItem.name}</strong> ({classItem.subject}, Section: {classItem.section}) - {classItem.studentCount} Students, {classItem.groupCount} Groups
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{message}</p> // Display the message if there are no classes
                    )}
                </div>

                {/* File upload section */}
                <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                    <h3>Add a New Class</h3>
                    <input
                        type="text"
                        placeholder="Enter Class Name"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                    />
                    <br />
                    <input
                        type="text"
                        placeholder="Enter Subject"
                        value={newClassSubject}
                        onChange={(e) => setNewClassSubject(e.target.value)}
                    />
                    <br />
                    <input
                        type="text"
                        placeholder="Enter Section"
                        value={newClassSection}
                        onChange={(e) => setNewClassSection(e.target.value)}
                    />
                    <br />
                    <input
                        type="text"
                        placeholder="Enter Class ID"
                        value={newClassID}
                        onChange={(e) => setNewClassID(e.target.value)}
                    />
                    <br />
                    <input type="file" accept=".csv" onChange={handleFileChange} />
                    <button onClick={handleUpload}>Upload Roster</button>
                    {message && <p>{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default InstructorManageClasses;
