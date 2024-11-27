import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import InstructorSidebar from '../_InstructorSidebar';

const InstructorManageClasses = () => {
    const [classes, setClasses] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newClassName, setNewClassName] = useState('');
    const [newClassSubject, setNewClassSubject] = useState('');
    const [newClassSection, setNewClassSection] = useState('');
    const [newClassID, setNewClassID] = useState('');
    const [message, setMessage] = useState('');
    const [instructorID, setInstructorID] = useState(null);
    const [selectedClassID, setSelectedClassID] = useState('');
    const [newDeadline, setNewDeadline] = useState('');
    const navigate = useNavigate();
    const [instructorID, setInstructorID] = useState(null); // Store instructor's ID
    const [selectedClassID, setSelectedClassID] = useState(''); // To update deadlines
    const [newDeadline, setNewDeadline] = useState(''); // To update deadlines
    const [handleUpdateDeadline, setEditingDeadline] = useState(false); // Deadline editing state
    const navigate = useNavigate();  // React Router hook for navigation

    useEffect(() => {
        fetchUserData();
        fetchClasses();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await axios.get('http://localhost:3000/index', {
                withCredentials: true,
            });

            if (response.data.user && response.data.user.ID) {
                setInstructorID(response.data.user.ID);
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
                setMessage('');
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            setMessage(error.response?.data?.message || 'Failed to fetch classes.');
        }
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

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
        formData.append('instructorID', instructorID);

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
                submissionDeadline: null,
            }]);

            setNewClassName('');
            setNewClassSubject('');
            setNewClassSection('');
            setNewClassID('');
            setSelectedFile(null);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Failed to upload roster.');
        }
    };

    const handleClassClick = (classID) => {
        if (classID) {
            navigate(`/instructorManageGroups/${classID}`);
        } else {
            console.error('No classID found!');
        }
    };

    const handleUpdateDeadline = async () => {
        if (!newDeadline) {
            alert('Please enter a valid deadline.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/updateDeadline', {
                classID: parseInt(selectedClassID, 10),
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
        } catch (error) {
            console.error('Error updating deadline:', error);
            alert('Failed to update deadline.');
        }
    };

    return (
        <div className="manage-classes-container" style={{ display: 'flex' }}>
            <InstructorSidebar />
            <div className="content" style={{ padding: '20px', flex: 1 }}>
                <div className="w-full bg-blue-500 text-white py-10 text-center rounded-md">
                    <h2 className="text-3xl font-bold">Manage Classes</h2>
                </div>
                <div>
                    {classes.length > 0 ? (
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            {classes.map((classItem, index) => (
                                <div
                                    key={index}
                                    className="p-4 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300 transition-colors duration-300"
                                    onClick={() => handleClassClick(classItem.id)}
                                >
                                    <h3 className="text-xl font-bold">{classItem.name}</h3>
                                    <p>{classItem.subject}, Section: {classItem.section}</p>
                                    <p>{classItem.studentCount} Students</p>
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

                <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                    <h3>Add a New Class</h3>
                    <input type="text" placeholder="Class Name" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} />
                    <input type="text" placeholder="Subject" value={newClassSubject} onChange={(e) => setNewClassSubject(e.target.value)} />
                    <input type="text" placeholder="Section" value={newClassSection} onChange={(e) => setNewClassSection(e.target.value)} />
                    <input type="text" placeholder="Class ID" value={newClassID} onChange={(e) => setNewClassID(e.target.value)} />
                    <input type="file" onChange={handleFileChange} />
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <button
                        onClick={handleUpload}
                        style={{
                            backgroundColor: '#007bff',
                            color: '#fff',
                            padding: '15px',
                            borderRadius: '50%',
                            border: 'none',
                            fontWeight: 'bold',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '50px',
                            height: '50px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>&uarr;</span>
                    </button>
                    <button
                        onClick={handleUpload}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#007bff',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                        }}
                    >
                        Upload
                    </button>
                </div>
                </div>

                <div style={{ marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                    <h3>Update Class Deadline</h3>
                    <select
                        onChange={(e) => setSelectedClassID(e.target.value)}
                        value={selectedClassID}
                    >
                        <option value="">Select Class</option>
                        {classes.map((classItem) => (
                            <option key={classItem.id} value={classItem.id}>
                                {classItem.name} - {classItem.subject} - {classItem.section}
                            </option>
                        ))}
                    </select>
                    <input type="date" onChange={(e) => setNewDeadline(e.target.value)} value={newDeadline} />
                    <button onClick={handleUpdateDeadline}>Save Deadline</button>
                </div>
            </div>
        </div>
    );
};

export default InstructorManageClasses;
