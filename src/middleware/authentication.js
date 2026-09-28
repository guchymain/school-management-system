const jwt = require("jsonwebtoken")
const { users } = require("../data/database")

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    // Make sure the account still exists
    const user = users.find((u) => u.id === decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      })
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }

    next()

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === "TokenExpiredError" ? "Token has expired" : "Invalid token"
    })
  }
}

module.exports = authenticate
