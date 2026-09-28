const { z } = require("zod")
const { id, atLeastOneField } = require("./common")

// grade is not accepted from the client - it is calculated from the score
const createResultSchema = z.object({
  studentId: id("Student ID"),
  subjectId: id("Subject ID"),

  score: z
    .number("Score must be a number")
    .min(0, "Score cannot be less than 0")
    .max(100, "Score cannot be more than 100"),

  term: z.enum(["First", "Second", "Third"], "Term must be First, Second or Third"),

  session: z
    .string("Session is required")
    .trim()
    .regex(/^\d{4}\/\d{4}$/, { message: "Session must look like 2025/2026", abort: true })
    .refine((value) => {
      const [start, end] = value.split("/").map(Number)
      return end === start + 1
    }, "Session years must be consecutive e.g. 2025/2026")
}).strict()

const updateResultSchema = atLeastOneField(createResultSchema)

module.exports = { createResultSchema, updateResultSchema }
