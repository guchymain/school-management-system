const express = require("express")
const router = express.Router()

const authenticate = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createStudentSchema, updateStudentSchema } = require("../validators/student")

const { getStudents, getStudent, addStudent, updateStudent, deleteStudent } = require("../controllers/studentController")

// Every student route needs a logged in user
router.use(authenticate)

router.get("/", authorize("admin", "teacher", "student"), getStudents)
router.get("/:id", authorize("admin", "teacher", "student"), validate(idParamSchema, "params"), getStudent)

router.post("/", authorize("admin"), validate(createStudentSchema), addStudent)
router.put("/:id", authorize("admin"), validate(idParamSchema, "params"), validate(updateStudentSchema), updateStudent)
router.delete("/:id", authorize("admin"), validate(idParamSchema, "params"), deleteStudent)

module.exports = router
