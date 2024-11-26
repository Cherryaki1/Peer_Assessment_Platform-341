const express = require('express');
const request = require('supertest');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const StudentModel = require('../models/studentModel');
const ClassModel = require('../models/classModel');
const InstructorModel = require('../models/instructorModel');

// Mock Models
jest.mock('../models/studentModel', () => ({
    find: jest.fn(),
    insertMany: jest.fn(),
    updateMany: jest.fn(),
}));
jest.mock('../models/classModel', () => jest.fn(() => ({ save: jest.fn() })));
jest.mock('../models/instructorModel', () => ({
    updateOne: jest.fn(),
}));

describe('POST /uploadClass', () => {
    let app;
    let upload;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        upload = multer({ dest: 'uploads/' });
        app.post('/uploadClass', upload.single('roster'), async (req, res) => {
            try {
                const { className, subject, section, instructorID, classID } = req.body;

                if (!className || !subject || !section || !instructorID || !classID || !req.file) {
                    return res.status(400).json({ message: 'Missing class details or CSV file.' });
                }

                const students = [];
                fs.createReadStream(req.file.path)
                    .on('data', (chunk) => {
                        chunk
                            .toString()
                            .split('\n')
                            .slice(1)
                            .forEach((line) => {
                                const [ID, FirstName, LastName] = line.split(',');
                                if (ID && FirstName && LastName) {
                                    students.push({ ID: parseInt(ID), FirstName, LastName });
                                }
                            });
                    })
                    .on('end', async () => {
                        try {
                            const studentIDs = students.map((s) => s.ID);
                            const existingStudents = await StudentModel.find({ ID: { $in: studentIDs } });

                            const newStudents = students.filter(
                                (s) => !existingStudents.some((es) => es.ID === s.ID)
                            );

                            if (newStudents.length > 0) {
                                await StudentModel.insertMany(newStudents);
                            }

                            const newClass = new ClassModel({
                                Name: className,
                                Subject: subject,
                                Section: section,
                                ID: classID,
                                Instructor: parseInt(instructorID),
                                Students: studentIDs,
                            });

                            await newClass.save();
                            await InstructorModel.updateOne(
                                { ID: instructorID },
                                { $addToSet: { Classes: classID } }
                            );
                            await StudentModel.updateMany(
                                { ID: { $in: studentIDs } },
                                { $addToSet: { Classes: classID } }
                            );

                            fs.unlinkSync(req.file.path);

                            res.status(201).json({
                                message: 'Class created successfully',
                                studentCount: studentIDs.length,
                                groupCount: Math.ceil(studentIDs.length / 5),
                            });
                        } catch (error) {
                            res.status(500).json({ message: 'Error processing the CSV file' });
                        }
                    })
                    .on('error', (error) => {
                        console.error('Error reading CSV file:', error);
                        res.status(500).json({ message: 'Error reading the CSV file.' });
                    });
            } catch (error) {
                res.status(500).json({ message: 'Failed to upload class roster' });
            }
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('successfully uploads a class with a valid CSV file', async () => {
        const mockFilePath = path.join(__dirname, 'mockRoster.csv');
        fs.writeFileSync(mockFilePath, 'ID,FirstName,LastName\n1,John,Doe\n2,Jane,Smith');

        StudentModel.find.mockResolvedValue([]);
        StudentModel.insertMany.mockResolvedValue([]);
        InstructorModel.updateOne.mockResolvedValue({});
        StudentModel.updateMany.mockResolvedValue({});
        ClassModel.mockImplementation(() => ({
            save: jest.fn().mockResolvedValue({}),
        }));

        const response = await request(app)
            .post('/uploadClass')
            .field('className', 'Test Class')
            .field('subject', 'Math')
            .field('section', '101')
            .field('instructorID', '1')
            .field('classID', '1')
            .attach('roster', mockFilePath);

        fs.unlinkSync(mockFilePath);

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Class created successfully');
        expect(response.body.studentCount).toBe(2);
        expect(response.body.groupCount).toBe(1);
    });

    test('returns 400 if class details or CSV file are missing', async () => {
        const response = await request(app)
            .post('/uploadClass')
            .field('className', 'Test Class')
            .field('subject', 'Math');

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Missing class details or CSV file.');
    }); 
});
