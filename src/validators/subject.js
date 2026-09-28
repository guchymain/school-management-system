const { z } = require("zod")
const { atLeastOneField } = require("./common")

const createSubjectSchema = z.object({
  name: z
    .string("Subject name is required")
    .trim()
    .min(2, "Subject name must be at least 2 characters")
    .max(50, "Subject name must not exceed 50 characters"),

  code: z
    .string("Subject code is required")
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}\d{3}$/, "Subject code must look like MTH101")
}).strict()

const updateSubjectSchema = atLeastOneField(createSubjectSchema)

module.exports = { createSubjectSchema, updateSubjectSchema }
