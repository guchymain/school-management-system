const { classes, teachers, students } = require("../data/database")
const AppError = require("../utils/appError")
const { generateId } = require("../utils/helpers")
const { findOwnStudent } = require("./studentController")

const checkTeacherExists = (teacherId) => {
  if (teacherId !== null && !teachers.some((teacher) => teacher.id === teacherId)) {
    throw new AppError("Form teacher not found", 404)
  }
}

const checkNameIsFree = (name, ignoreId) => {
  if (classes.some((c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== ignoreId)) {
    throw new AppError("A class with this name already exists", 409)
  }
}

const getClasses = (req, res) => {
  // Students can only see their own class
  if (req.user.role === "student") {
    const ownStudent = findOwnStudent(req.user)
    const ownClass = ownStudent && classes.find((c) => c.id === ownStudent.classId)

    return res.status(200).json({
      success: true,
      count: ownClass ? 1 : 0,
      classes: ownClass ? [ownClass] : []
    })
  }

  res.status(200).json({
    success: true,
    count: classes.length,
    classes
  })
}

const getClass = (req, res) => {
  const id = Number(req.params.id)

  const foundClass = classes.find((c) => c.id === id)

  if (!foundClass) {
    throw new AppError("Class not found", 404)
  }

  if (req.user.role === "student") {
    const ownStudent = findOwnStudent(req.user)

    if (!ownStudent || ownStudent.classId !== id) {
      throw new AppError("Forbidden. You can only view your own class", 403)
    }
  }

  res.status(200).json({
    success: true,
    class: foundClass
  })
}

const addClass = (req, res) => {
  const { name, formTeacherId = null } = req.body

  checkNameIsFree(name)
  checkTeacherExists(formTeacherId)

  const newClass = {
    id: generateId(classes),
    name,
    formTeacherId,
    createdAt: new Date().toISOString()
  }

  classes.push(newClass)

  res.status(201).json({
    success: true,
    message: "Class added successfully",
    class: newClass
  })
}

const updateClass = (req, res) => {
  const id = Number(req.params.id)

  const foundClass = classes.find((c) => c.id === id)

  if (!foundClass) {
    throw new AppError("Class not found", 404)
  }

  const { name, formTeacherId } = req.body

  if (name !== undefined) checkNameIsFree(name, id)
  if (formTeacherId !== undefined) checkTeacherExists(formTeacherId)

  foundClass.name = name ?? foundClass.name
  // formTeacherId can be set to null to remove the form teacher
  if (formTeacherId !== undefined) foundClass.formTeacherId = formTeacherId
  foundClass.updatedAt = new Date().toISOString()

  res.status(200).json({
    success: true,
    message: "Class updated successfully",
    class: foundClass
  })
}

const deleteClass = (req, res) => {
  const id = Number(req.params.id)

  const classIndex = classes.findIndex((c) => c.id === id)

  if (classIndex === -1) {
    throw new AppError("Class not found", 404)
  }

  if (students.some((student) => student.classId === id)) {
    throw new AppError("Cannot delete a class that still has students", 409)
  }

  const deletedClass = classes.splice(classIndex, 1)

  res.status(200).json({
    success: true,
    message: "Class deleted successfully",
    class: deletedClass[0]
  })
}

module.exports = { getClasses, getClass, addClass, updateClass, deleteClass }
