import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../_InstructorSidebar';

const InstructorManageClasses = () => {
    const [classes, setClasses] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newClassName, setNewClassName] = useState('');
    const [newClassSubject, setNewClassSubject] = useState('');
    const [newClassSection, setNewClassSection] = useState('');
    const [newClassID, setNewClassID] = useState('');
    const [message, setMessage] = useState('');
    const [instructorID, setInstructorID] = useState(null); // Store instructor's ID
    const [selectedClassID, setSelectedClassID] = useState(''); // To update deadlines
    const [newDeadline, setNewDeadline] = useState(''); // To update deadlines
    const [editingDeadline, setEditingDeadline] = useState(false); // Deadline editing state
    const navigate = useNavigate();  // React Router hook for navigation

    // Fetch current classes and instructor details when the component mounts
    useEffect(() => {
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
                groupCount: response.data.groupCount,
                submissionDeadline: null 
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

    // Function to handle clicking on a class
    const handleClassClick = (classID) => {
        console.log('Navigating to classID:', classID);  // Debug to see if classID exists
        if (classID) {
            navigate(`/instructorManageGroups/${classID}`);
        } else {
            console.error('No classID found!');
        }
    };
    const handleEditDeadline = (classID) => {
        setSelectedClassID(classID);
        setEditingDeadline(true);
    };

    const handleUpdateDeadline = async () => {
        if (!newDeadline) {
            alert('Please enter a valid deadline.');
            return;
        }
    
        try {
            // Ensure `selectedClassID` is sent as a string
            const response = await axios.post('http://localhost:3000/updateDeadline', {
                classID: parseInt(selectedClassID, 10), // Ensure it's sent as an integer
                submissionDeadline: new Date(newDeadline).toISOString(),
            });
    
            setClasses((prevClasses) =>
                prevClasses.map((classItem) =>
                    classItem.ID === parseInt(selectedClassID, 10)
                        ? { ...classItem, submissionDeadline: new Date(newDeadline) }
                        : classItem
                )
            );
            
            setNewDeadline('');
            setSelectedClassID('');
            await fetchClasses();
            setMessage(response.data.message);
            setEditingDeadline(false);

        } catch (error) {
            console.error('Error updating deadline:', error);
            alert('Failed to update deadline.');
        }
    };
    

    return (
        <div className="manage-classes-container" style={{ display: 'flex' }}>
            <InstructorSidebar />
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <div
                    className="
                    w-full 
                    bg-blue-500 
                    text-white 
                    py-10 
                    text-center  
                    rounded-md"
                >
                    <h2
                        className="
                        text-3xl 
                        font-bold"
                    >
                        Manage Classes
                    </h2>
                </div>
                <div>
                    {classes.length > 0 ? (
                        <div
                            className="
                            grid 
                            grid-cols-3 
                            gap-4 
                            mt-4"
                        >
                            {classes.map((classItem, index) => (
                                <div
                                    key={index}
                                    className="
                                    p-4 
                                    bg-gray-200 
                                    rounded-md 
                                    cursor-pointer 
                                    hover:bg-gray-300 
                                    transition-colors 
                                    duration-300"
                                    onClick={() => handleClassClick(classItem.id)}
                                >
                                    <h3 className="text-xl font-bold">{classItem.name}</h3>
                                    <p>{classItem.subject}, Section: {classItem.section}</p>
                                    <p>{classItem.studentCount} Students</p>
                                    <p>{classItem.groupCount} Groups</p>
                                    <p>
                                        Deadline:{" "}
                                        {classItem.submissionDeadline
                                            ? new Date(classItem.submissionDeadline).toLocaleDateString()
                                            : "No deadline set"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>{message}</p>
                    )}
                </div>

                <div
                    style={{
                        marginTop: '20px',
                        borderTop: '1px solid #ccc',
                        paddingTop: '10px',
                    }}
                >
                    <h3>Add a New Class</h3>
                    <input
                        type="text"
                        placeholder="Class Name"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Subject"
                        value={newClassSubject}
                        onChange={(e) => setNewClassSubject(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Section"
                        value={newClassSection}
                        onChange={(e) => setNewClassSection(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Class ID"
                        value={newClassID}
                        onChange={(e) => setNewClassID(e.target.value)}
                    />
                    <input type="file" onChange={handleFileChange} />
                    <button onClick={handleUpload}>Upload</button>
                </div>

                <div
                    style={{
                        marginTop: '20px',
                        borderTop: '1px solid #ccc',
                        paddingTop: '10px',
                    }}
                >
                    <h3>Update Class Deadline</h3>
                    <select
                        onChange={(e) => setSelectedClassID(e.target.value)}
                        value={selectedClassID}
                    >
                        <option value="">Select Class</option>
                        {classes.map((classItem) => (
                            <option key={classItem.id} value={classItem.id}>
                                {classItem.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        onChange={(e) => setNewDeadline(e.target.value)}
                        value={newDeadline}
                    />
                    <button onClick={handleSaveDeadline}>Save Deadline</button>
                </div>
            </div>
        </div>
    );
};

export default InstructorManageClasses;
