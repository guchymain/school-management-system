const bcrypt = require("bcrypt")

// Seed accounts so the API can be tested straight away.
// Passwords are hashed on startup - plain-text passwords are never stored.
const hash = (password) => bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS) || 10)

const users = [
  {
    id: 1,
    name: "Warchief",
    email: "admin@school.com",
    phone: "08010000001",
    password: hash("Admin@123"),
    role: "admin",
  },
  {
    id: 2,
    name: "Grace Okafor",
    email: "grace.okafor@school.com",
    phone: "08020000001",
    password: hash("Teacher@123"),
    role: "teacher",
    createdAt: "2026-01-05T08:00:00.000Z"
  },
  {
    id: 3,
    name: "Tunde Bello",
    email: "tunde.bello@school.com",
    phone: "08030000001",
    password: hash("Student@123"),
    role: "student",
    createdAt: "2026-01-05T08:00:00.000Z"
  }
]

const subjects = [
  { id: 1, name: "Mathematics", code: "MTH101", createdAt: "2026-01-05T08:00:00.000Z" },
  { id: 2, name: "English Language", code: "ENG101", createdAt: "2026-01-05T08:00:00.000Z" },
  { id: 3, name: "Basic Science", code: "BSC101", createdAt: "2026-01-05T08:00:00.000Z" }
]

const teachers = [
  {
    id: 1,
    name: "Grace Okafor",
    email: "grace.okafor@school.com",
    phone: "08020000001",
    subjectId: 1,
    createdAt: "2026-01-05T08:00:00.000Z"
  },
  {
    id: 2,
    name: "Samuel Adeyemi",
    email: "samuel.adeyemi@school.com",
    phone: "08020000002",
    subjectId: 2,
    createdAt: "2026-01-05T08:00:00.000Z"
  }
]

const classes = [
  { id: 1, name: "JSS 1A", formTeacherId: 1, createdAt: "2026-01-05T08:00:00.000Z" },
  { id: 2, name: "JSS 2A", formTeacherId: 2, createdAt: "2026-01-05T08:00:00.000Z" }
]

const students = [
  {
    id: 1,
    name: "Tunde Bello",
    email: "tunde.bello@school.com",
    phone: "08030000001",
    classId: 1,
    createdAt: "2026-01-05T08:00:00.000Z"
  },
  {
    id: 2,
    name: "Amaka Obi",
    email: "amaka.obi@school.com",
    phone: "08030000002",
    classId: 1,
    createdAt: "2026-01-05T08:00:00.000Z"
  },
  {
    id: 3,
    name: "Ibrahim Musa",
    email: "ibrahim.musa@school.com",
    phone: "08030000003",
    classId: 2,
    createdAt: "2026-01-05T08:00:00.000Z"
  }
]

const results = [
  { id: 1, studentId: 1, subjectId: 1, score: 78, grade: "A", term: "First", session: "2025/2026", createdAt: "2026-01-20T08:00:00.000Z" },
  { id: 2, studentId: 1, subjectId: 2, score: 64, grade: "B", term: "First", session: "2025/2026", createdAt: "2026-01-20T08:00:00.000Z" },
  { id: 3, studentId: 2, subjectId: 1, score: 52, grade: "C", term: "First", session: "2025/2026", createdAt: "2026-01-20T08:00:00.000Z" },
  { id: 4, studentId: 3, subjectId: 3, score: 38, grade: "F", term: "First", session: "2025/2026", createdAt: "2026-01-20T08:00:00.000Z" }
]

module.exports = { users, students, teachers, classes, subjects, results }
