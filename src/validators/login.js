const { z } = require("zod")
const { email } = require("./common")

const loginSchema = z.object({
  email,
  password: z.string("Password is required").min(1, "Password is required")
}).strict()

module.exports = loginSchema
