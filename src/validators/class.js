const { z } = require("zod")
const { id, atLeastOneField } = require("./common")

const createClassSchema = z.object({
  name: z
    .string("Class name is required")
    .trim()
    .min(2, "Class name must be at least 2 characters")
    .max(50, "Class name must not exceed 50 characters"),

  formTeacherId: id("Form teacher ID").nullable().optional()
}).strict()

const updateClassSchema = atLeastOneField(createClassSchema)

module.exports = { createClassSchema, updateClassSchema }
