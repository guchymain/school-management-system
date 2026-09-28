const express = require("express")
const router = express.Router()

const authenticate = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createTeacherSchema, updateTeacherSchema } = require("../validators/teacher")

const { getTeachers, getTeacher, addTeacher, updateTeacher, deleteTeacher } = require("../controllers/teacherController")

// Only admins can manage teachers
router.use(authenticate, authorize("admin"))

router.get("/", getTeachers)
router.get("/:id", validate(idParamSchema, "params"), getTeacher)

router.post("/", validate(createTeacherSchema), addTeacher)
router.put("/:id", validate(idParamSchema, "params"), validate(updateTeacherSchema), updateTeacher)
router.delete("/:id", validate(idParamSchema, "params"), deleteTeacher)

module.exports = router
