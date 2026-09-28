const { z } = require("zod")
const { name, email, phone, id, atLeastOneField } = require("./common")

const createStudentSchema = z.object({
  name,
  email,
  phone,
  classId: id("Class ID")
}).strict()

const updateStudentSchema = atLeastOneField(createStudentSchema)

module.exports = { createStudentSchema, updateStudentSchema }
