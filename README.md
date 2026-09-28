# School Management System API

A REST API for managing a school's students, teachers, classes, subjects and results. Built with **Node.js** and **Express**.

There is no frontend and no real database. All data is kept in memory in `src/data/database.js`, so it resets every time the server restarts.

## Features

- Register and log in with **JWT** authentication
- Passwords hashed with **bcrypt**. Passwords are never stored in plain text or returned in a response.
- Role-based authorization for `admin`, `teacher` and `student`
- Request validation with **zod**, including strict bodies that reject unknown fields
- Global error handler with a consistent response shape
- Request logger that records the method, URL, status code and timestamp
- Rate limiting: 20 requests per 15 minutes on register/login, and 200 per 15 minutes on the rest of the API
- Related in-memory data: results point to students and subjects, and students point to classes

## Setup

```bash
cd school-management-system
npm install
cp .env.example .env    # then set a long random JWT_SECRET
npm run dev             # or: npm start
```

The server runs on `http://localhost:5000` (or whatever you set as `PORT`).

### Environment variables

| Variable         | Description                         | Example |
|------------------|-------------------------------------|---------|
| `PORT`           | Port the server listens on          | `5000`  |
| `JWT_SECRET`     | Secret used to sign JWTs (required) | long random string |
| `JWT_EXPIRES_IN` | How long a token lasts              | `1h`    |
| `SALT_ROUNDS`    | bcrypt salt rounds                  | `10`    |

## Seed accounts

These accounts are for testing only.

| Role    | Email                     | Password      |
|---------|---------------------------|---------------|
| admin   | admin@school.com          | `Admin@123`   |
| teacher | grace.okafor@school.com   | `Teacher@123` |
| student | tunde.bello@school.com    | `Student@123` |

Public registration can only create `teacher` or `student` accounts. Admin accounts can't be self-registered.

A **student user is linked to their student record by email**. For example, the user `tunde.bello@school.com` owns the student record with that email (id 1).

## Project structure

```
school-management-system/
├── src/
│   ├── controllers/     # request handlers (auth, student, teacher, class, subject, result)
│   ├── routes/          # *.route.js - maps endpoints to middleware + controllers
│   ├── middleware/      # authentication, authorization, validate, logger, rateLimiter, error, notFound
│   ├── validators/      # zod schemas
│   ├── utils/           # AppError, id generator, grade calculator, removePassword
│   ├── data/            # in-memory "database"
│   ├── app.js
│   └── server.js
├── school-management-system.postman_collection.json
├── .env.example
└── README.md
```

## Endpoints and permissions

Send all protected routes an `Authorization: Bearer <token>` header.

| Endpoint | Admin | Teacher | Student |
|---|---|---|---|
| `POST /api/auth/register` | public | public | public |
| `POST /api/auth/login` | public | public | public |
| `GET /api/auth/me` | ✓ | ✓ | ✓ |
| `GET /api/students`, `GET /api/students/:id` | ✓ | ✓ | own record only |
| `POST/PUT/DELETE /api/students` | ✓ | ✗ | ✗ |
| `GET/POST/PUT/DELETE /api/teachers` | ✓ | ✗ | ✗ |
| `GET /api/classes`, `GET /api/classes/:id` | ✓ | ✓ | own class only |
| `POST/PUT/DELETE /api/classes` | ✓ | ✗ | ✗ |
| `GET /api/subjects`, `GET /api/subjects/:id` | ✓ | ✓ | ✓ |
| `POST/PUT/DELETE /api/subjects` | ✓ | ✗ | ✗ |
| `GET /api/results`, `GET /api/results/:id` | ✓ | ✓ | own results only |
| `POST/PUT /api/results` | ✓ | ✓ | ✗ |
| `DELETE /api/results/:id` | ✓ | ✗ | ✗ |

### Request bodies

```jsonc
// POST /api/auth/register
{ "name": "Chidi Nwosu", "email": "chidi@school.com", "phone": "08045556677", "password": "Chidi@1234", "role": "student" }

// POST /api/students
{ "name": "Ada Eze", "email": "ada@school.com", "phone": "08099998888", "classId": 1 }

// POST /api/teachers
{ "name": "Bola Adeleke", "email": "bola@school.com", "phone": "08077776666", "subjectId": 1 }

// POST /api/classes   (formTeacherId is optional)
{ "name": "SS 1A", "formTeacherId": 1 }

// POST /api/subjects
{ "name": "Civic Education", "code": "CIV101" }

// POST /api/results   (grade is calculated from the score)
{ "studentId": 1, "subjectId": 1, "score": 67, "term": "First", "session": "2025/2026" }
```

`PUT` requests accept any subset of the same fields, but you must send at least one.

### Validation rules

- **Password:** 8–64 characters, with at least one uppercase letter, lowercase letter, number and special character
- **Phone:** exactly 11 digits
- **Email:** must be a valid email; it is stored in lowercase
- **IDs:** positive whole numbers, and the record they point to must exist
- **Score:** a number from 0 to 100
- **Term:** `First`, `Second` or `Third`
- **Session:** consecutive years, like `2025/2026`
- **Subject code:** 3 letters followed by 3 digits, like `MTH101`

### Grading

| Score | 70–100 | 60–69 | 50–59 | 45–49 | 40–44 | 0–39 |
|---|---|---|---|---|---|---|
| Grade | A | B | C | D | E | F |

### Data integrity

- Emails are unique for students and teachers, codes are unique for subjects, and names are unique for classes (`409 Conflict`).
- Each student can have only one result per subject, term and session.
- Deleting a student also deletes their results.
- Deleting a teacher removes them as form teacher from any class.
- You can't delete a class that still has students, or a subject that is used by teachers or results (`409 Conflict`).

## Responses

Success:

```json
{ "success": true, "message": "Student added successfully", "student": { "id": 4, "...": "..." } }
```

Error:

```json
{ "success": false, "message": "Student not found" }
```

Validation error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

| Status | When |
|---|---|
| 200 / 201 | Success / created |
| 400 | Validation failed, invalid id or invalid JSON |
| 401 | Missing, invalid or expired token, or wrong login details |
| 403 | Logged in, but the role doesn't have permission |
| 404 | Record or route not found |
| 409 | Duplicate record, or a delete that would break related data |
| 429 | Rate limit reached |
| 500 | Unexpected error (details are only logged on the server) |

## Testing with Postman

1. Start the server (`npm run dev`).
2. Import `school-management-system.postman_collection.json` into Postman. Thunder Client can import it too.
3. Run the whole collection with the **Collection Runner**, or run the folders in order.

Login requests save tokens automatically (`adminToken`, `teacherToken`, `studentToken`), and create requests save the new ids. The collection covers registration, login, JWT auth, 401/403 cases, CRUD for every resource, result management, validation errors and error handling. Every request has test assertions.

Restart the server before re-running the collection, so the in-memory data and the rate-limit counters reset.

You can also run it from the command line:

```bash
npx newman run school-management-system.postman_collection.json
```
