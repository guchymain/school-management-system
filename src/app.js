const express = require("express")
const app = express()

const logger = require("./middleware/logger")
const errorHandler = require("./middleware/error")
const notFound = require("./middleware/notFound")
const { apiLimiter } = require("./middleware/rateLimiter")

const authRoutes = require("./routes/auth.route")
const studentRoutes = require("./routes/student.route")
const teacherRoutes = require("./routes/teacher.route")
const classRoutes = require("./routes/class.route")
const subjectRoutes = require("./routes/subject.route")
const resultRoutes = require("./routes/result.route")

// Don't reveal that the server runs Express
app.disable("x-powered-by")

app.use(logger)
app.use(express.json({ limit: "10kb" }))

//Routes
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome, School Management System API is running"
  })
})

app.use("/api", apiLimiter)
app.use("/api/auth", authRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/teachers", teacherRoutes)
app.use("/api/classes", classRoutes)
app.use("/api/subjects", subjectRoutes)
app.use("/api/results", resultRoutes)

//404 and errorHandler
app.use(notFound)
app.use(errorHandler)

module.exports = app
