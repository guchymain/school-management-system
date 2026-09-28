// Next id = highest existing id + 1, so ids are never reused after a delete
const generateId = (collection) => {
  return collection.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

const calculateGrade = (score) => {
  if (score >= 70) return "A"
  if (score >= 60) return "B"
  if (score >= 50) return "C"
  if (score >= 45) return "D"
  if (score >= 40) return "E"
  return "F"
}

// Never send password hashes back to the client
const removePassword = (user) => {
  const { password, ...safeUser } = user
  return safeUser
}

module.exports = { generateId, calculateGrade, removePassword }
