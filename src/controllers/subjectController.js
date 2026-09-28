const { subjects, teachers, results } = require("../data/database")
const AppError = require("../utils/appError")
const { generateId } = require("../utils/helpers")

const checkCodeIsFree = (code, ignoreId) => {
  if (subjects.some((subject) => subject.code === code && subject.id !== ignoreId)) {
    throw new AppError("A subject with this code already exists", 409)
  }
}

const getSubjects = (req, res) => {
  res.status(200).json({
    success: true,
    count: subjects.length,
    subjects
  })
}

const getSubject = (req, res) => {
  const id = Number(req.params.id)

  const subject = subjects.find((subject) => subject.id === id)

  if (!subject) {
    throw new AppError("Subject not found", 404)
  }

  res.status(200).json({
    success: true,
    subject
  })
}

const addSubject = (req, res) => {
  const { name, code } = req.body

  checkCodeIsFree(code)

  const newSubject = {
    id: generateId(subjects),
    name,
    code,
    createdAt: new Date().toISOString()
  }

  subjects.push(newSubject)

  res.status(201).json({
    success: true,
    message: "Subject added successfully",
    subject: newSubject
  })
}

const updateSubject = (req, res) => {
  const id = Number(req.params.id)

  const subject = subjects.find((subject) => subject.id === id)

  if (!subject) {
    throw new AppError("Subject not found", 404)
  }

  const { name, code } = req.body

  if (code !== undefined) checkCodeIsFree(code, id)

  subject.name = name ?? subject.name
  subject.code = code ?? subject.code
  subject.updatedAt = new Date().toISOString()

  res.status(200).json({
    success: true,
    message: "Subject updated successfully",
    subject
  })
}

const deleteSubject = (req, res) => {
  const id = Number(req.params.id)

  const subjectIndex = subjects.findIndex((subject) => subject.id === id)

  if (subjectIndex === -1) {
    throw new AppError("Subject not found", 404)
  }

  if (teachers.some((teacher) => teacher.subjectId === id) || results.some((result) => result.subjectId === id)) {
    throw new AppError("Cannot delete a subject that is assigned to teachers or has results", 409)
  }

  const deletedSubject = subjects.splice(subjectIndex, 1)

  res.status(200).json({
    success: true,
    message: "Subject deleted successfully",
    subject: deletedSubject[0]
  })
}

module.exports = { getSubjects, getSubject, addSubject, updateSubject, deleteSubject }
