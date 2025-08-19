const asyncHandler = require("express-async-handler");
const { ApiError } = require("../../utils");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent } = require("./students-service");

const handleGetAllStudents = asyncHandler(async (req, res) => {
    const { name, className, section, roll } = req.query;
    const payload = { name, className, section, roll };
    const students = await getAllStudents(payload);
    res.json({ students });
});

const handleAddStudent = asyncHandler(async (req, res) => {
    const { name, email, phone, gender, dob, class: className, section, roll, 
            fatherName, fatherPhone, motherName, motherPhone, 
            guardianName, guardianPhone, relationOfGuardian,
            currentAddress, permanentAddress, admissionDate } = req.body;

    // Basic validation
    if (!name || !email) {
        throw new ApiError(400, "Name and email are required fields");
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }
    
    const { id: reporterId } = req.user;
    
    const payload = { 
        name, email, phone, gender, dob, class: className, section, roll,
        fatherName, fatherPhone, motherName, motherPhone,
        guardianName, guardianPhone, relationOfGuardian,
        currentAddress, permanentAddress, admissionDate, reporterId
    };
    const result = await addNewStudent(payload);
    res.json(result);
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, gender, dob, class: className, section, roll, 
            fatherName, fatherPhone, motherName, motherPhone, 
            guardianName, guardianPhone, relationOfGuardian,
            currentAddress, permanentAddress, admissionDate } = req.body;
    
    // Basic validation for update
    if (!name || !email) {
        throw new ApiError(400, "Name and email are required fields");
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }
    
    const { id: reporterId } = req.user;
    
    const payload = { 
        userId: parseInt(id), name, email, phone, gender, dob, class: className, section, roll,
        fatherName, fatherPhone, motherName, motherPhone,
        guardianName, guardianPhone, relationOfGuardian,
        currentAddress, permanentAddress, admissionDate, reporterId
    };
    const result = await updateStudent(payload);
    res.json(result);
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Validate student ID
    if (!id || isNaN(parseInt(id))) {
        throw new ApiError(400, "Valid student ID is required");
    }
    
    const student = await getStudentDetail(parseInt(id));
    res.json(student);
});

const handleStudentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { id: reviewerId } = req.user;

    // Validate student ID
    if (!id || isNaN(parseInt(id))) {
        throw new ApiError(400, "Valid student ID is required");
    }
    
    // Validate status
    if (status === undefined || ![true, false].includes(status)) {
        throw new ApiError(400, "Status must be a boolean value (true/false)");
    }
    
    const payload = { userId: parseInt(id), reviewerId, status };
    const result = await setStudentStatus(payload);
    res.json(result);
});

module.exports = {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent,
};
