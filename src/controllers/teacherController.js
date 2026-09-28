const { teachers, subjects, classes } = require("../data/database")
const AppError = require("../utils/appError")
const { generateId } = require("../utils/helpers")

const checkSubjectExists = (subjectId) => {
  if (!subjects.some((subject) => subject.id === subjectId)) {
    throw new AppError("Subject not found", 404)
  }
}

const checkEmailIsFree = (email, ignoreId) => {
  if (teachers.some((teacher) => teacher.email === email && teacher.id !== ignoreId)) {
    throw new AppError("A teacher with this email already exists", 409)
  }
}

const getTeachers = (req, res) => {
  res.status(200).json({
    success: true,
    count: teachers.length,
    teachers
  })
}

const getTeacher = (req, res) => {
  const id = Number(req.params.id)

  const teacher = teachers.find((teacher) => teacher.id === id)

  if (!teacher) {
    throw new AppError("Teacher not found", 404)
  }

  res.status(200).json({
    success: true,
    teacher
  })
}

const addTeacher = (req, res) => {
  const { name, email, phone, subjectId } = req.body

  checkEmailIsFree(email)
  checkSubjectExists(subjectId)

  const newTeacher = {
    id: generateId(teachers),
    name,
    email,
    phone,
    subjectId,
    createdAt: new Date().toISOString()
  }

  teachers.push(newTeacher)

  res.status(201).json({
    success: true,
    message: "Teacher added successfully",
    teacher: newTeacher
  })
}

const updateTeacher = (req, res) => {
  const id = Number(req.params.id)

  const teacher = teachers.find((teacher) => teacher.id === id)

  if (!teacher) {
    throw new AppError("Teacher not found", 404)
  }

  const { name, email, phone, subjectId } = req.body

  if (email !== undefined) checkEmailIsFree(email, id)
  if (subjectId !== undefined) checkSubjectExists(subjectId)

  teacher.name = name ?? teacher.name
  teacher.email = email ?? teacher.email
  teacher.phone = phone ?? teacher.phone
  teacher.subjectId = subjectId ?? teacher.subjectId
  teacher.updatedAt = new Date().toISOString()

  res.status(200).json({
    success: true,
    message: "Teacher updated successfully",
    teacher
  })
}

const deleteTeacher = (req, res) => {
  const id = Number(req.params.id)

  const teacherIndex = teachers.findIndex((teacher) => teacher.id === id)

  if (teacherIndex === -1) {
    throw new AppError("Teacher not found", 404)
  }

  const deletedTeacher = teachers.splice(teacherIndex, 1)

  // Classes this teacher was in charge of no longer have a form teacher
  classes.forEach((c) => {
    if (c.formTeacherId === id) c.formTeacherId = null
  })

  res.status(200).json({
    success: true,
    message: "Teacher deleted successfully",
    teacher: deletedTeacher[0]
  })
}

module.exports = { getTeachers, getTeacher, addTeacher, updateTeacher, deleteTeacher }
