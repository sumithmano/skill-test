const express = require("express");
const router = express.Router();
const studentController = require("./students-controller");
const { isUserAdmin } = require("../../middlewares");
const { 
    validateBody, 
    validateQuery, 
    validateParams,
    createStudentSchema, 
    updateStudentSchema, 
    queryParamsSchema, 
    studentIdSchema, 
    studentStatusSchema 
} = require("./students-schema");

// Apply validation middleware to routes
router.get("", validateQuery(queryParamsSchema), studentController.handleGetAllStudents);
router.post("", isUserAdmin, validateBody(createStudentSchema), studentController.handleAddStudent);
router.get("/:id", validateParams(studentIdSchema), studentController.handleGetStudentDetail);
router.post("/:id/status", isUserAdmin, validateParams(studentIdSchema), validateBody(studentStatusSchema), studentController.handleStudentStatus);
router.put("/:id", isUserAdmin, validateParams(studentIdSchema), validateBody(updateStudentSchema), studentController.handleUpdateStudent);

module.exports = { studentsRoutes: router };
