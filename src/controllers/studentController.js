const { students, classes, results } = require("../data/database")
const AppError = require("../utils/appError")
const { generateId } = require("../utils/helpers")

// A student user is linked to their student record by email
const findOwnStudent = (user) => {
  return students.find((student) => student.email === user.email)
}

const checkClassExists = (classId) => {
  if (!classes.some((c) => c.id === classId)) {
    throw new AppError("Class not found", 404)
  }
}

const checkEmailIsFree = (email, ignoreId) => {
  if (students.some((student) => student.email === email && student.id !== ignoreId)) {
    throw new AppError("A student with this email already exists", 409)
  }
}

const getStudents = (req, res) => {
  // Students can only see their own record
  if (req.user.role === "student") {
    const ownStudent = findOwnStudent(req.user)

    return res.status(200).json({
      success: true,
      count: ownStudent ? 1 : 0,
      students: ownStudent ? [ownStudent] : []
    })
  }

  res.status(200).json({
    success: true,
    count: students.length,
    students
  })
}

const getStudent = (req, res) => {
  const id = Number(req.params.id)

  const student = students.find((student) => student.id === id)

  if (!student) {
    throw new AppError("Student not found", 404)
  }

  if (req.user.role === "student" && student.email !== req.user.email) {
    throw new AppError("Forbidden. You can only view your own profile", 403)
  }

  res.status(200).json({
    success: true,
    student
  })
}

const addStudent = (req, res) => {
  const { name, email, phone, classId } = req.body

  checkEmailIsFree(email)
  checkClassExists(classId)

  const newStudent = {
    id: generateId(students),
    name,
    email,
    phone,
    classId,
    createdAt: new Date().toISOString()
  }

  students.push(newStudent)

  res.status(201).json({
    success: true,
    message: "Student added successfully",
    student: newStudent
  })
}

const updateStudent = (req, res) => {
  const id = Number(req.params.id)

  const student = students.find((student) => student.id === id)

  if (!student) {
    throw new AppError("Student not found", 404)
  }

  const { name, email, phone, classId } = req.body

  if (email !== undefined) checkEmailIsFree(email, id)
  if (classId !== undefined) checkClassExists(classId)

  student.name = name ?? student.name
  student.email = email ?? student.email
  student.phone = phone ?? student.phone
  student.classId = classId ?? student.classId
  student.updatedAt = new Date().toISOString()

  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    student
  })
}

const deleteStudent = (req, res) => {
  const id = Number(req.params.id)

  const studentIndex = students.findIndex((student) => student.id === id)

  if (studentIndex === -1) {
    throw new AppError("Student not found", 404)
  }

  const deletedStudent = students.splice(studentIndex, 1)

  // Remove the student's results as well so no result points to a missing student
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].studentId === id) results.splice(i, 1)
  }

  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
    student: deletedStudent[0]
  })
}

module.exports = { getStudents, getStudent, addStudent, updateStudent, deleteStudent, findOwnStudent }
