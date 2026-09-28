require("dotenv").config({ quiet: true })

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing")
  process.exit(1)
}

const app = require("./app")

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
