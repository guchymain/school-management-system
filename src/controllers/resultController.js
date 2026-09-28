const { results, students, subjects } = require("../data/database")
const AppError = require("../utils/appError")
const { generateId, calculateGrade } = require("../utils/helpers")
const { findOwnStudent } = require("./studentController")

const checkStudentAndSubject = (studentId, subjectId) => {
  if (!students.some((student) => student.id === studentId)) {
    throw new AppError("Student not found", 404)
  }

  if (!subjects.some((subject) => subject.id === subjectId)) {
    throw new AppError("Subject not found", 404)
  }
}

// One result per student, per subject, per term, per session
const checkNotDuplicate = ({ studentId, subjectId, term, session }, ignoreId) => {
  const duplicate = results.some((result) =>
    result.id !== ignoreId &&
    result.studentId === studentId &&
    result.subjectId === subjectId &&
    result.term === term &&
    result.session === session
  )

  if (duplicate) {
    throw new AppError("A result already exists for this student, subject, term and session", 409)
  }
}

const getResults = (req, res) => {
  // Students can only see their own results
  if (req.user.role === "student") {
    const ownStudent = findOwnStudent(req.user)
    const ownResults = ownStudent ? results.filter((result) => result.studentId === ownStudent.id) : []

    return res.status(200).json({
      success: true,
      count: ownResults.length,
      results: ownResults
    })
  }

  res.status(200).json({
    success: true,
    count: results.length,
    results
  })
}

const getResult = (req, res) => {
  const id = Number(req.params.id)

  const result = results.find((result) => result.id === id)

  if (!result) {
    throw new AppError("Result not found", 404)
  }

  if (req.user.role === "student") {
    const ownStudent = findOwnStudent(req.user)

    if (!ownStudent || ownStudent.id !== result.studentId) {
      throw new AppError("Forbidden. You can only view your own results", 403)
    }
  }

  res.status(200).json({
    success: true,
    result
  })
}

const addResult = (req, res) => {
  const { studentId, subjectId, score, term, session } = req.body

  checkStudentAndSubject(studentId, subjectId)
  checkNotDuplicate(req.body)

  const newResult = {
    id: generateId(results),
    studentId,
    subjectId,
    score,
    grade: calculateGrade(score),
    term,
    session,
    createdAt: new Date().toISOString()
  }

  results.push(newResult)

  res.status(201).json({
    success: true,
    message: "Result added successfully",
    result: newResult
  })
}

const updateResult = (req, res) => {
  const id = Number(req.params.id)

  const result = results.find((result) => result.id === id)

  if (!result) {
    throw new AppError("Result not found", 404)
  }

  // Merge first so we can validate the final version of the result
  const updated = { ...result, ...req.body }

  checkStudentAndSubject(updated.studentId, updated.subjectId)
  checkNotDuplicate(updated, id)

  result.studentId = updated.studentId
  result.subjectId = updated.subjectId
  result.score = updated.score
  result.grade = calculateGrade(updated.score)
  result.term = updated.term
  result.session = updated.session
  result.updatedAt = new Date().toISOString()

  res.status(200).json({
    success: true,
    message: "Result updated successfully",
    result
  })
}

const deleteResult = (req, res) => {
  const id = Number(req.params.id)

  const resultIndex = results.findIndex((result) => result.id === id)

  if (resultIndex === -1) {
    throw new AppError("Result not found", 404)
  }

  const deletedResult = results.splice(resultIndex, 1)

  res.status(200).json({
    success: true,
    message: "Result deleted successfully",
    result: deletedResult[0]
  })
}

module.exports = { getResults, getResult, addResult, updateResult, deleteResult }
