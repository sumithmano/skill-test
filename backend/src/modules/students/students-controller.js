const asyncHandler = require("express-async-handler");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent } = require("./students-service");
const {
    studentIdSchema
} = require("./students-schema");

const handleGetAllStudents = asyncHandler(async (req, res) => {
    const { name, className, section, roll } = req.query;
    const payload = { name, className, section, roll };
    const students = await getAllStudents(payload);
    res.json({ students });
});

const handleAddStudent = asyncHandler(async (req, res) => {
    const {
        name, email, phone, gender, dob, class: className, section, roll,
        fatherName, fatherPhone, motherName, motherPhone,
        guardianName, guardianPhone, relationOfGuardian,
        currentAddress, permanentAddress, admissionDate
    } = req.body;

    const { id: reporterId } = req.user;

    const payload = {
        name,
        email,
        phone,
        gender,
        dob,
        class: className,
        section,
        roll,
        fatherName,
        fatherPhone,
        motherName,
        motherPhone,
        guardianName,
        guardianPhone,
        relationOfGuardian,
        currentAddress,
        permanentAddress,
        admissionDate,
        reporterId
    };

    const result = await addNewStudent(payload);
    res.json(result);
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        name, email, phone, gender, dob, class: className, section, roll,
        fatherName, fatherPhone, motherName, motherPhone,
        guardianName, guardianPhone, relationOfGuardian,
        currentAddress, permanentAddress, admissionDate
    } = req.body;

    const studentId = studentIdSchema.parse(id);
    const { id: reporterId } = req.user;

    const payload = {
        userId: studentId,
        name,
        email,
        phone,
        gender,
        dob,
        class: className,
        section,
        roll,
        fatherName,
        fatherPhone,
        motherName,
        motherPhone,
        guardianName,
        guardianPhone,
        relationOfGuardian,
        currentAddress,
        permanentAddress,
        admissionDate,
        reporterId
    };

    const result = await updateStudent(payload);
    res.json(result);
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const studentId = studentIdSchema.parse(id);

    const student = await getStudentDetail(studentId);
    res.json(student);
});

const handleStudentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const { id: reviewerId } = req.user;

    const studentId = studentIdSchema.parse(id);

    const payload = { userId: studentId, reviewerId, status };
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
