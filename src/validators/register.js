const { z } = require("zod")
const { name, email, phone } = require("./common")

const registerSchema = z.object({
  name,
  email,
  phone,

  password: z
    .string("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must not exceed 64 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

  // Admin accounts cannot be created through public registration
  role: z
    .enum(["teacher", "student"], "Role must be either teacher or student")
    .default("student")
}).strict()

module.exports = registerSchema
