# School Management System API

A backend API for managing students, teachers, classes, subjects, and student results.

Built with **Node.js**, **Express**, **JWT**, **bcrypt**, and **Zod**.

There is no frontend or external database yet. The project currently uses an in-memory database located at `src/data/database.js`, so all changes are lost when the server is restarted.

## What it does

The API supports:

* User registration and login
* JWT-based authentication
* Role-based access for admins, teachers, and students
* CRUD operations for students, teachers, classes, subjects, and results
* Request validation with Zod
* Password hashing with bcrypt
* Request logging
* Rate limiting
* Relationship checks between records
* Automatic result grading based on scores
* Consistent error responses

## Getting started

Clone the project and install the dependencies:

```bash
cd school-management-system
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Set a secure `JWT_SECRET` in `.env`, then start the server:

```bash
npm run dev
```

Or:

```bash
npm start
```

By default, the API runs on:

```text
http://localhost:5000
```

You can change the port through the `PORT` environment variable.

## Environment variables

| Variable         | Purpose                  | Example            |
| ---------------- | ------------------------ | ------------------ |
| `PORT`           | Server port              | `5000`             |
| `JWT_SECRET`     | Secret used to sign JWTs | `your-long-secret` |
| `JWT_EXPIRES_IN` | JWT expiration time      | `1h`               |
| `SALT_ROUNDS`    | bcrypt salt rounds       | `10`               |

## Test accounts

The project comes with a few accounts for testing the protected endpoints.

| Role    | Email                     | Password      |
| ------- | ------------------------- | ------------- |
| Admin   | `admin@school.com`        | `Admin@123`   |
| Teacher | `grace.okafor@school.com` | `Teacher@123` |
| Student | `tunde.bello@school.com`  | `Student@123` |

These are development/test accounts and should not be used in a production environment.

Anyone can register through the API, but public registration only allows the `teacher` and `student` roles. Admin accounts have to be created separately.

The student account is connected to a student record using the email address. For example, `tunde.bello@school.com` is linked to student record `id: 1`.

## Project structure

```text
school-management-system/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── validators/
│   ├── utils/
│   ├── data/
│   ├── app.js
│   └── server.js
├── school-management-system.postman_collection.json
├── .env.example
└── README.md
```

### What the folders are for

**controllers/**
Contains the logic for handling requests for authentication, students, teachers, classes, subjects, and results.

**routes/**
Defines the API endpoints and connects them to the required middleware and controllers.

**middleware/**
Contains reusable request processing such as authentication, authorization, validation, logging, rate limiting, error handling, and handling unknown routes.

**validators/**
Contains the Zod schemas used to check incoming request data.

**utils/**
Small reusable functions such as error handling, ID generation, password removal, and grade calculation.

**data/**
Contains the in-memory data used by the application.

**app.js**
Sets up Express, middleware, routes, and the global error handler.

**server.js**
Starts the Express server.

## Authentication

Protected endpoints require a JWT:

```http
Authorization: Bearer <token>
```

Log in through:

```http
POST /api/auth/login
```

The returned token can then be used when accessing protected routes.

There is also:

```http
GET /api/auth/me
```

which returns information about the currently authenticated user.

Passwords are hashed with bcrypt and are never returned in API responses.

## Roles and permissions

The API has three roles:

* `admin`
* `teacher`
* `student`

The role attached to the authenticated user's JWT determines which operations they can perform.

| Endpoint                   | Admin | Teacher |  Student  |
| -------------------------- | :---: | :-----: | :-------: |
| `POST /api/auth/register`  |   ✓   |    ✓    |     ✓     |
| `POST /api/auth/login`     |   ✓   |    ✓    |     ✓     |
| `GET /api/auth/me`         |   ✓   |    ✓    |     ✓     |
| `GET /api/students`        |   ✓   |    ✓    |    Own    |
| `GET /api/students/:id`    |   ✓   |    ✓    |    Own    |
| `POST /api/students`       |   ✓   |    —    |     —     |
| `PUT /api/students/:id`    |   ✓   |    —    |     —     |
| `DELETE /api/students/:id` |   ✓   |    —    |     —     |
| `GET /api/teachers`        |   ✓   |    —    |     —     |
| `POST /api/teachers`       |   ✓   |    —    |     —     |
| `PUT /api/teachers/:id`    |   ✓   |    —    |     —     |
| `DELETE /api/teachers/:id` |   ✓   |    —    |     —     |
| `GET /api/classes`         |   ✓   |    ✓    | Own class |
| `GET /api/classes/:id`     |   ✓   |    ✓    | Own class |
| `POST /api/classes`        |   ✓   |    —    |     —     |
| `PUT /api/classes/:id`     |   ✓   |    —    |     —     |
| `DELETE /api/classes/:id`  |   ✓   |    —    |     —     |
| `GET /api/subjects`        |   ✓   |    ✓    |     ✓     |
| `GET /api/subjects/:id`    |   ✓   |    ✓    |     ✓     |
| `POST /api/subjects`       |   ✓   |    —    |     —     |
| `PUT /api/subjects/:id`    |   ✓   |    —    |     —     |
| `DELETE /api/subjects/:id` |   ✓   |    —    |     —     |
| `GET /api/results`         |   ✓   |    ✓    |    Own    |
| `GET /api/results/:id`     |   ✓   |    ✓    |    Own    |
| `POST /api/results`        |   ✓   |    ✓    |     —     |
| `PUT /api/results/:id`     |   ✓   |    ✓    |     —     |
| `DELETE /api/results/:id`  |   ✓   |    —    |     —     |

## Main request examples

### Register

```http
POST /api/auth/register
```

```json
{
  "name": "Chidi Nwosu",
  "email": "chidi@school.com",
  "phone": "08045556677",
  "password": "Chidi@1234",
  "role": "student"
}
```

### Create a student

```http
POST /api/students
```

```json
{
  "name": "Ada Eze",
  "email": "ada@school.com",
  "phone": "08099998888",
  "classId": 1
}
```

### Create a teacher

```http
POST /api/teachers
```

```json
{
  "name": "Bola Adeleke",
  "email": "bola@school.com",
  "phone": "08077776666",
  "subjectId": 1
}
```

### Create a class

```http
POST /api/classes
```

```json
{
  "name": "SS 1A",
  "formTeacherId": 1
}
```

`formTeacherId` is optional.

### Create a subject

```http
POST /api/subjects
```

```json
{
  "name": "Civic Education",
  "code": "CIV101"
}
```

### Add a result

```http
POST /api/results
```

```json
{
  "studentId": 1,
  "subjectId": 1,
  "score": 67,
  "term": "First",
  "session": "2025/2026"
}
```

The grade is calculated automatically from the score, so `grade` does not need to be included in the request.

For `PUT` requests, the fields are optional, but at least one field must be provided.

## Validation

Incoming data is checked before it reaches the controllers.

Some of the rules include:

* Passwords must be 8–64 characters long.
* Passwords must contain uppercase and lowercase letters, a number, and a special character.
* Phone numbers must contain exactly 11 digits.
* Emails must be valid and are stored in lowercase.
* IDs must be positive whole numbers.
* Referenced records must exist.
* Scores must be between `0` and `100`.
* Terms can be `First`, `Second`, or `Third`.
* Sessions must follow the `2025/2026` format.
* Subject codes must follow the `MTH101` format.
* Request bodies reject fields that are not part of the schema.

## Grading

Results are graded automatically:

| Score  | Grade |
| ------ | ----- |
| 70–100 | A     |
| 60–69  | B     |
| 50–59  | C     |
| 45–49  | D     |
| 40–44  | E     |
| 0–39   | F     |

## Relationships between records

Some resources depend on other resources.

For example:

* A student can belong to a class.
* A teacher can be assigned to a subject.
* A class can have a form teacher.
* A result belongs to a student and a subject.

The API checks these relationships before creating or deleting records.

For example, you cannot delete a class while students are still assigned to it.

Other rules include:

* Student and teacher emails must be unique.
* Subject codes must be unique.
* Class names must be unique.
* A student cannot have two results for the same subject, term, and session.
* Deleting a student also removes their results.
* Deleting a teacher removes them as a form teacher from any class.
* A subject cannot be deleted while it is being used by a teacher or result.

These conflicts return a `409` response.

## Responses

Successful requests follow a simple structure:

```json
{
  "success": true,
  "message": "Student added successfully",
  "student": {
    "id": 4
  }
}
```

A normal error looks like:

```json
{
  "success": false,
  "message": "Student not found"
}
```

Validation errors include the affected fields:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

### HTTP status codes

| Status | Meaning                                           |
| ------ | ------------------------------------------------- |
| `200`  | Request completed successfully                    |
| `201`  | Resource created                                  |
| `400`  | Invalid request or validation error               |
| `401`  | Authentication failed or token is missing/invalid |
| `403`  | User does not have permission                     |
| `404`  | Resource or route was not found                   |
| `409`  | Request conflicts with existing data              |
| `429`  | Rate limit exceeded                               |
| `500`  | Unexpected server error                           |

## Rate limiting

Authentication endpoints are limited to **20 requests every 15 minutes**:

```text
POST /api/auth/register
POST /api/auth/login
```

The rest of the API allows **200 requests every 15 minutes**.

This is mainly there to prevent repeated requests while testing the API.

## Logging and error handling

Every request is logged with:

* HTTP method
* URL
* Response status
* Timestamp

For example:

```text
POST /api/auth/login - 200 - 14:32:10
```

Errors are handled through a global error handler so that API responses follow the same format.

Unexpected errors are logged on the server, while the API returns a general `500` response instead of exposing internal error details.

## Testing with Postman

The repository includes:

```text
school-management-system.postman_collection.json
```

Import the collection into **Postman** and start the server before running the requests.

The collection can also be imported into **Thunder Client**.

The requests are arranged so that you can test the application from authentication through the different resources. Login requests save the returned JWTs, while create requests save generated IDs for later requests.

The collection also includes tests for:

* Registration and login
* Protected routes
* Invalid and missing tokens
* Role permissions
* CRUD operations
* Validation failures
* Duplicate records
* Result creation and updates
* Error responses

Because the API uses in-memory data, restart the server before running the collection again if you want to start with the original seed data.

You can also run the collection with Newman:

```bash
npx newman run school-management-system.postman_collection.json
```

## Note

This project currently uses in-memory data to keep the setup simple. Restarting the server resets the data.

A natural next step would be replacing `src/data/database.js` with a real database while keeping the existing controllers, routes, validation, and authentication structure.
