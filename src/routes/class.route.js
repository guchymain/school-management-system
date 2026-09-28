const express = require("express")
const router = express.Router()

const authenticate = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createClassSchema, updateClassSchema } = require("../validators/class")

const { getClasses, getClass, addClass, updateClass, deleteClass } = require("../controllers/classController")

router.use(authenticate)

router.get("/", authorize("admin", "teacher", "student"), getClasses)
router.get("/:id", authorize("admin", "teacher", "student"), validate(idParamSchema, "params"), getClass)

router.post("/", authorize("admin"), validate(createClassSchema), addClass)
router.put("/:id", authorize("admin"), validate(idParamSchema, "params"), validate(updateClassSchema), updateClass)
router.delete("/:id", authorize("admin"), validate(idParamSchema, "params"), deleteClass)

module.exports = router
