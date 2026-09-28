const express = require("express")
const router = express.Router()

const authenticate = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createSubjectSchema, updateSubjectSchema } = require("../validators/subject")

const { getSubjects, getSubject, addSubject, updateSubject, deleteSubject } = require("../controllers/subjectController")

router.use(authenticate)

router.get("/", authorize("admin", "teacher", "student"), getSubjects)
router.get("/:id", authorize("admin", "teacher", "student"), validate(idParamSchema, "params"), getSubject)

router.post("/", authorize("admin"), validate(createSubjectSchema), addSubject)
router.put("/:id", authorize("admin"), validate(idParamSchema, "params"), validate(updateSubjectSchema), updateSubject)
router.delete("/:id", authorize("admin"), validate(idParamSchema, "params"), deleteSubject)

module.exports = router
