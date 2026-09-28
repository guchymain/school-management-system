const { z } = require("zod")

const name = z
  .string("Name is required")
  .trim()
  .min(3, "Name must be at least 3 characters")
  .max(100, "Name must not exceed 100 characters")

const email = z
  .string("Email is required")
  .trim()
  .toLowerCase()
  .email("Invalid email")

const phone = z
  .string("Phone number is required")
  .trim()
  .regex(/^\d{11}$/, "Phone number must be 11 digits")

const id = (label) => z
  .number({
    error: (issue) => issue.input === undefined ? `${label} is required` : `${label} must be a number`
  })
  .int(`${label} must be a whole number`)
  .positive(`${label} must be a positive number`)

// Validates :id in the URL
const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^[1-9]\d*$/, "ID must be a positive whole number")
})

// Update schemas must have at least one field
const atLeastOneField = (schema) => schema
  .partial()
  .refine((data) => Object.keys(data).length > 0, "Provide at least one field to update")

module.exports = { name, email, phone, id, idParamSchema, atLeastOneField }
