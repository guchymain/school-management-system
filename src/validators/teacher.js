const { z } = require("zod")
const { name, email, phone, id, atLeastOneField } = require("./common")

const createTeacherSchema = z.object({
  name,
  email,
  phone,
  subjectId: id("Subject ID")
}).strict()

const updateTeacherSchema = atLeastOneField(createTeacherSchema)

module.exports = { createTeacherSchema, updateTeacherSchema }
