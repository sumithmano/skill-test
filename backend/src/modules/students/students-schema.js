const { z } = require("zod");
const { ApiError } = require("../../utils");

// Common validation patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s\-\+\(\)]+$/;
const nameRegex = /^[a-zA-Z\s\-']+$/;

// Base student schema with common fields
const baseStudentSchema = z.object({
    name: z.string()
        .min(2, "Student name must be at least 2 characters long")
        .max(100, "Student name cannot exceed 100 characters")
        .regex(nameRegex, "Student name can only contain letters, spaces, hyphens, and apostrophes")
        .trim(),
    
    email: z.string()
        .email("Invalid email format")
        .max(100, "Email cannot exceed 100 characters")
        .trim(),
    
    phone: z.string()
        .regex(phoneRegex, "Invalid phone number format")
        .max(20, "Phone number cannot exceed 20 characters")
        .optional()
        .nullable(),
    
    gender: z.enum(["Male", "Female", "Other"], {
        errorMap: () => ({ message: "Gender must be Male, Female, or Other" })
    }).optional()
    .nullable(),
    
    dob: z.string()
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid date format. Use YYYY-MM-DD"
        })
        .refine((date) => {
            const birthDate = new Date(date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            return age >= 3 && age <= 25;
        }, {
            message: "Student age must be between 3 and 25 years"
        }),
    
    class: z.string()
        .min(1, "Class is required")
        .max(50, "Class name cannot exceed 50 characters"),
    
    section: z.string()
        .max(10, "Section name cannot exceed 10 characters")
        .optional()
        .nullable(),
    
    roll: z.number()
        .int("Roll number must be an integer")
        .positive("Roll number must be positive")
        .max(999, "Roll number cannot exceed 999")
        .optional()
        .nullable(),
    
    fatherName: z.string()
        .max(100, "Father's name cannot exceed 100 characters")
        .regex(nameRegex, "Father's name can only contain letters, spaces, hyphens, and apostrophes")
        .optional()
        .nullable(),
    
    fatherPhone: z.string()
        .regex(phoneRegex, "Invalid father's phone number format")
        .max(20, "Father's phone number cannot exceed 20 characters")
        .optional()
        .nullable(),
    
    motherName: z.string()
        .max(100, "Mother's name cannot exceed 100 characters")
        .regex(nameRegex, "Mother's name can only contain letters, spaces, hyphens, and apostrophes")
        .optional()
        .nullable(),
    
    motherPhone: z.string()
        .regex(phoneRegex, "Invalid mother's phone number format")
        .max(20, "Mother's phone number cannot exceed 20 characters")
        .optional()
        .nullable(),
    
    guardianName: z.string()
        .max(100, "Guardian's name cannot exceed 100 characters")
        .regex(nameRegex, "Guardian's name can only contain letters, spaces, hyphens, and apostrophes")
        .optional()
        .nullable(),
    
    guardianPhone: z.string()
        .regex(phoneRegex, "Invalid guardian's phone number format")
        .max(20, "Guardian's phone number cannot exceed 20 characters")
        .optional()
        .nullable(),
    
    relationOfGuardian: z.string()
        .max(30, "Guardian relation cannot exceed 30 characters")
        .optional()
        .nullable(),
    
    currentAddress: z.string()
        .max(200, "Current address cannot exceed 200 characters")
        .optional()
        .nullable(),
    
    permanentAddress: z.string()
        .max(200, "Permanent address cannot exceed 200 characters")
        .optional()
        .nullable(),
    
    admissionDate: z.string()
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Invalid admission date format. Use YYYY-MM-DD"
        })
        .refine((date) => {
            const admissionDate = new Date(date);
            const today = new Date();
            return admissionDate <= today;
        }, {
            message: "Admission date cannot be in the future"
        })
        .optional()
        .nullable()
});

// Schema for creating a new student
const createStudentSchema = baseStudentSchema.extend({
    // Additional validation for create operation
    name: baseStudentSchema.shape.name,
    email: baseStudentSchema.shape.email,
    class: baseStudentSchema.shape.class,
    dob: baseStudentSchema.shape.dob
});

// Schema for updating a student
const updateStudentSchema = baseStudentSchema.extend({
    // All fields are optional for updates
    name: baseStudentSchema.shape.name.optional(),
    email: baseStudentSchema.shape.email.optional(),
    class: baseStudentSchema.shape.class.optional(),
    dob: baseStudentSchema.shape.dob.optional()
});

// Schema for query parameters (GET /students)
const queryParamsSchema = z.object({
    name: z.string().optional(),
    className: z.string().optional(),
    section: z.string().optional(),
    roll: z.string()
        .transform((val) => parseInt(val))
        .refine((val) => !isNaN(val) && val > 0, {
            message: "Roll number must be a positive integer"
        })
        .optional(),
    page: z.string()
        .transform((val) => parseInt(val))
        .refine((val) => !isNaN(val) && val >= 1, {
            message: "Page must be a positive integer"
        })
        .default("1"),
    limit: z.string()
        .transform((val) => parseInt(val))
        .refine((val) => !isNaN(val) && val >= 1 && val <= 100, {
            message: "Limit must be between 1 and 100"
        })
        .default("10"),
    sortBy: z.enum(["id", "name", "email", "class", "section", "roll"], {
        errorMap: () => ({ message: "Sort field must be one of: id, name, email, class, section, roll" })
    }).default("id"),
    sortOrder: z.enum(["asc", "desc"], {
        errorMap: () => ({ message: "Sort order must be 'asc' or 'desc'" })
    }).default("asc")
});

// Schema for student ID parameter
const studentIdSchema = z.string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val > 0, {
        message: "Student ID must be a positive integer"
    });

// Schema for student status update
const studentStatusSchema = z.object({
    status: z.boolean({
        errorMap: () => ({ message: "Status must be a boolean value (true/false)" })
    })
});

// Helper function to format Zod errors for ApiError
const formatZodErrors = (zodError) => {
    const errors = zodError.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
    }));
    
    if (errors.length === 1) {
        return errors[0].message;
    }
    
    return `Validation failed: ${errors.map(err => `${err.field}: ${err.message}`).join(', ')}`;
};

// Validation middleware functions
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.body);
            req.body = validatedData;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new ApiError(400, formatZodErrors(error));
            }
            next(error);
        }
    };
};

const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.query);
            req.query = validatedData;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new ApiError(400, formatZodErrors(error));
            }
            next(error);
        }
    };
};

const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.params.id);
            req.params.id = validatedData;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new ApiError(400, error.errors[0].message);
            }
            next(error);
        }
    };
};

// Export schemas and validation middleware
module.exports = {
    createStudentSchema,
    updateStudentSchema,
    queryParamsSchema,
    studentIdSchema,
    studentStatusSchema,
    validateBody,
    validateQuery,
    validateParams
};
