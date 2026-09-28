const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { users } = require("../data/database")
const { generateId, removePassword } = require("../utils/helpers")

const register = async (req, res) => {
  const { name, email, phone, password, role } = req.body

  const existingUser = users.find((user) => user.email === email)

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "A user with this email already exists"
    })
  }

  const hashPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS) || 10)

  const newUser = {
    id: generateId(users),
    name,
    email,
    phone,
    password: hashPassword,
    role,
    createdAt: new Date().toISOString()
  }

  users.push(newUser)

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: removePassword(newUser)
  })
}

const login = async (req, res) => {
  const { email, password } = req.body

  const user = users.find((u) => u.email === email)

  // Same message for wrong email and wrong password so attackers can't tell which one failed
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    })
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    })
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h"
    }
  )

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: removePassword(user),
    token
  })
}

// Returns the logged in user's account
const getMe = (req, res) => {
  const user = users.find((u) => u.id === req.user.id)

  res.status(200).json({
    success: true,
    user: removePassword(user)
  })
}

module.exports = { register, login, getMe }
