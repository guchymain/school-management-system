const express = require("express")
const router = express.Router()

const authenticate = require("../middleware/authentication")
const authorize = require("../middleware/authorization")
const { validate } = require("../middleware/validate")
const { idParamSchema } = require("../validators/common")
const { createResultSchema, updateResultSchema } = require("../validators/result")

const { getResults, getResult, addResult, updateResult, deleteResult } = require("../controllers/resultController")

router.use(authenticate)

router.get("/", authorize("admin", "teacher", "student"), getResults)
router.get("/:id", authorize("admin", "teacher", "student"), validate(idParamSchema, "params"), getResult)

router.post("/", authorize("admin", "teacher"), validate(createResultSchema), addResult)
router.put("/:id", authorize("admin", "teacher"), validate(idParamSchema, "params"), validate(updateResultSchema), updateResult)
router.delete("/:id", authorize("admin"), validate(idParamSchema, "params"), deleteResult)

module.exports = router
