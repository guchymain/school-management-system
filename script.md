# Presentation Script: School Management System API

**Estimated length:** 15–18 minutes
**Format:** **DO** = what you do on screen. **SAY** = what you say.

---

## Before you hit record

- [ ] Close any tab that shows `.env`, because it contains your real JWT secret. Show `.env.example` instead.
- [ ] In the terminal, run `npm run dev` in `school-management-system/`. Restart it right before recording so the data and the rate limit start fresh.
- [ ] Put VS Code on one side and the terminal on the other, so the logger output is visible.
- [ ] Prepare Thunder Client:
  - Create a collection called **School Management System**, with folders for Auth, Students, Teachers, Classes, Subjects, Results and Errors.
  - Or import `school-management-system.postman_collection.json` (Thunder Client → Collections → menu → Import).
- [ ] Have a notepad ready for pasting tokens. You'll copy three tokens: admin, teacher and student.
- [ ] Zoom VS Code and Thunder Client to about 125% so the text is readable in the video.

**Base URL:** `http://localhost:5000`

**Seed accounts:**

| Role | Email | Password |
|---|---|---|
| admin | admin@school.com | Admin@123 |
| teacher | grace.okafor@school.com | Teacher@123 |
| student | tunde.bello@school.com | Student@123 |

---

## 1. Introduction (≈1 min)

**SAY:**
> Hi, my name is ___. This is my backend assessment project: a School Management System REST API built with Node.js and Express.
>
> It's backend only, with no frontend and no real database. The data lives in memory, in arrays.
>
> The API has:
> - authentication with JWT and bcrypt
> - three roles: admin, teacher and student
> - role-based authorization
> - CRUD for students, teachers, classes, subjects and results
> - input validation, a global error handler, a request logger and rate limiting
>
> First I'll walk through the code, then I'll test everything live with Thunder Client.

---

## 2. Project structure and setup (≈1.5 min)

**DO:** Expand the project in the VS Code explorer.

**SAY:**
> This is the project structure. Everything lives inside `src`:
> - **routes** define the endpoints
> - **controllers** hold the logic for each endpoint
> - **middleware** holds authentication, authorization, validation, logging, rate limiting and error handling
> - **validators** hold my zod schemas
> - **utils** has small helpers
> - **data** is my in-memory database
>
> `app.js` sets up Express, and `server.js` starts the server.

**DO:** Open `package.json`.

**SAY:**
> These are the packages I used:
> - `express` for the server
> - `bcrypt` for hashing passwords
> - `jsonwebtoken` for JWTs
> - `zod` for validation
> - `dotenv` for environment variables
> - `express-rate-limit` for rate limiting

**DO:** Open `.env.example`. Do not open `.env`.

**SAY:**
> Secrets are stored in a `.env` file. It holds the port, the JWT secret, the token expiry time and the bcrypt salt rounds.
>
> `.env` is in `.gitignore`, so the real secret never gets pushed. I've shared `.env.example` as a template.

**DO:** Open `src/server.js`.

**SAY:**
> `server.js` loads the environment variables first. If the JWT secret is missing, the server refuses to start instead of running insecurely.

---

## 3. app.js (≈1 min)

**DO:** Open `src/app.js`.

**SAY:**
> In `app.js`:
> - I disable the `x-powered-by` header, so I don't advertise that the server runs Express.
> - The logger runs on every request.
> - `express.json` parses request bodies, with a 10kb size limit.
> - A general rate limiter covers everything under `/api`.
> - Each resource has its own router: auth, students, teachers, classes, subjects and results.
>
> At the bottom there are two more middleware:
> - `notFound`, for routes that don't exist
> - the global `errorHandler`, which comes last so it catches every error.

---

## 4. Dummy data (≈1 min)

**DO:** Open `src/data/database.js` and scroll slowly.

**SAY:**
> This is my in-memory database: arrays for users, subjects, teachers, classes, students and results.
>
> The data is related by IDs:
> - a teacher has a `subjectId`
> - a class has a `formTeacherId`
> - a student has a `classId`
> - a result has a `studentId` and a `subjectId`
>
> So a result points to a student and a subject, just like in the task diagram.
>
> I seeded one admin, one teacher and one student so the API can be tested straight away. The passwords are hashed with bcrypt when the server starts, so even the seed data never stores plain-text passwords.

---

## 5. Authentication (≈2 min)

**DO:** Open `src/routes/auth.route.js`.

**SAY:**
> Register and login go through two middleware before the controller:
> - the **auth rate limiter**
> - the **validate** middleware with a zod schema

**DO:** Open `src/validators/register.js`.

**SAY:**
> The register schema checks:
> - the name is at least 3 characters
> - the email is valid
> - the phone number is 11 digits
> - the password is 8 to 64 characters, with an uppercase letter, a lowercase letter, a number and a special character
>
> The role can only be teacher or student. I deliberately don't allow anyone to register as admin through a public endpoint, because that would be a security hole.
>
> `.strict()` means any extra field in the body is rejected.

**DO:** Open `src/controllers/authController.js`.

**SAY:**
> In `register`:
> - I check that the email isn't already taken. If it is, I return 409 Conflict.
> - I hash the password with bcrypt and save the user.
> - I return the user through `removePassword`, so the hash is never sent back.
>
> In `login`:
> - I find the user and compare the password with `bcrypt.compare`.
> - Wrong email and wrong password get the same message, "Invalid email or password", so an attacker can't tell which accounts exist.
> - On success, I sign a JWT containing only the user's id and role, using the secret from `.env`.

---

## 6. Authentication and authorization middleware (≈1.5 min)

**DO:** Open `src/middleware/authentication.js`.

**SAY:**
> This is my authentication middleware. It:
> 1. checks for an `Authorization` header in the format `Bearer <token>`
> 2. verifies the token with `jwt.verify`
> 3. looks the user up to make sure the account still exists
> 4. attaches the user to `req.user`
>
> If anything fails, it returns **401 Unauthorized**, with a separate message for an expired token.

**DO:** Open `src/middleware/authorization.js`.

**SAY:**
> This is the authorization middleware. It takes a list of allowed roles, like `authorize("admin", "teacher")`. If the logged-in user's role isn't in that list, it returns **403 Forbidden**.
>
> So 401 means "I don't know who you are", and 403 means "I know who you are, but you're not allowed to do this".

**DO:** Open `src/routes/student.route.js`.

**SAY:**
> This is how it's used in the routes. `router.use(authenticate)` protects every student route.
> - Viewing is allowed for admin, teacher and student.
> - Creating, updating and deleting are admin only.
>
> The ID in the URL is validated too, before the request reaches the controller.

**DO:** Briefly open `src/routes/result.route.js`.

**SAY:**
> For results, teachers can create and update, but only the admin can delete.

---

## 7. Validation (≈1 min)

**DO:** Open `src/middleware/validate.js`.

**SAY:**
> This is my reusable validate middleware. It takes a zod schema and validates either the body or the URL params.
>
> If validation fails, it returns 400 with a list of errors. Each error shows the field and the message, which makes it easy for the client to know what to fix.

**DO:** Open `src/validators/result.js`.

**SAY:**
> For results:
> - the score must be between 0 and 100
> - the term must be First, Second or Third
> - the session must look like 2025/2026, with consecutive years
>
> The client can't send a grade. The grade is calculated on the server, so it always matches the score.

---

## 8. Controllers (≈2 min)

**DO:** Open `src/controllers/studentController.js`. Scroll to `getStudent`.

**SAY:**
> A student user is linked to their student record by email. In `getStudent`, if the logged-in user is a student asking for someone else's record, they get 403. That's how "students can only view their own profile" works.
>
> When a student is deleted, their results are deleted too, so no result is left pointing to a student that doesn't exist.

**DO:** Open `src/controllers/resultController.js`. Scroll to `addResult`.

**SAY:**
> When creating a result:
> - I check that the student and the subject actually exist.
> - I check it's not a duplicate for the same student, subject, term and session.
> - The grade is calculated from the score.

**DO:** Open `src/utils/helpers.js`.

**SAY:**
> These are the helpers:
> - `calculateGrade`: 70 and above is A, then B, C, D, E, and below 40 is F.
> - `generateId`: takes the highest existing id plus one, so ids are never reused after a delete.
> - `removePassword`: strips the password from user objects.

---

## 9. Error handling, logger and rate limiting (≈1.5 min)

**DO:** Open `src/utils/appError.js`, then `src/middleware/error.js`.

**SAY:**
> In the controllers, I throw an `AppError` with a message and a status code, like "Student not found" with 404. Express 5 automatically passes thrown errors to my global error handler.
>
> The error handler always returns the same shape: `success: false` and a message.
> - Malformed JSON gets a 400.
> - Unexpected errors return a generic "Internal server error". The real details are only logged on the server, so I don't expose anything sensitive.

**DO:** Open `src/middleware/logger.js`, then point at the terminal.

**SAY:**
> The logger records the timestamp, HTTP method, URL and status code. You'll see these lines appear in the terminal as I test.

**DO:** Open `src/middleware/rateLimiter.js`.

**SAY:**
> Register and login allow 20 requests per 15 minutes per IP. That slows down brute-force password guessing. The rest of the API allows 200 requests per 15 minutes.

**SAY:**
> Now let's test it live.

---

## 10. Live demo in Thunder Client (≈7–8 min)

> **Tip:** For each protected request, paste the token in Thunder Client under **Auth → Bearer**.
> Keep the terminal visible so the logger lines show up.

### 10.1 Health check

| DO | Request | Expect |
|---|---|---|
| Send | `GET http://localhost:5000/` | **200**, "API is running" |

### 10.2 Registration and validation

| DO | Request | Body | Expect |
|---|---|---|---|
| Register | `POST /api/auth/register` | `{"name":"Chidi Nwosu","email":"chidi@school.com","phone":"08045556677","password":"Chidi@1234","role":"student"}` | **201**, no password in the response |
| Duplicate | same request again | same body | **409**, "A user with this email already exists" |
| Invalid | `POST /api/auth/register` | `{"name":"Al","email":"not-an-email","phone":"123","password":"weak"}` | **400**, list of errors |
| Admin role | `POST /api/auth/register` | `{"name":"Sneaky User","email":"sneaky@school.com","phone":"08011111111","password":"Sneaky@123","role":"admin"}` | **400**, "Role must be either teacher or student" |

**SAY (on the 201):**
> The user was created. Notice there's no password field in the response.

**SAY (on the 400 list):**
> Every field that failed is listed with a clear message.

### 10.3 Login

| DO | Request | Body | Expect |
|---|---|---|---|
| Wrong password | `POST /api/auth/login` | `{"email":"admin@school.com","password":"Wrong@123"}` | **401** |
| Admin | `POST /api/auth/login` | `{"email":"admin@school.com","password":"Admin@123"}` | **200** + token → copy as **ADMIN TOKEN** |
| Teacher | `POST /api/auth/login` | `{"email":"grace.okafor@school.com","password":"Teacher@123"}` | **200** → copy as **TEACHER TOKEN** |
| Student | `POST /api/auth/login` | `{"email":"tunde.bello@school.com","password":"Student@123"}` | **200** → copy as **STUDENT TOKEN** |

**SAY:**
> Login returns a JWT. I'll use these three tokens to show how each role is treated differently.

### 10.4 401 Unauthorized

| DO | Request | Auth | Expect |
|---|---|---|---|
| No token | `GET /api/students` | none | **401**, "Authentication required" |
| Fake token | `GET /api/students` | Bearer `abc123` | **401**, "Invalid token" |
| With token | `GET /api/auth/me` | ADMIN | **200**, admin account (no password) |

### 10.5 Admin CRUD (use the ADMIN token)

**SAY:**
> Now I'll log in as admin and create a full chain of related records: a class, a subject, a teacher for that subject, and a student in that class.

| DO | Request | Body | Expect |
|---|---|---|---|
| Create class | `POST /api/classes` | `{"name":"SS 1A"}` | **201**, id **3** |
| Create subject | `POST /api/subjects` | `{"name":"Civic Education","code":"civ101"}` | **201**, id **4**, code saved as `CIV101` |
| Create teacher | `POST /api/teachers` | `{"name":"Bola Adeleke","email":"bola@school.com","phone":"08077776666","subjectId":4}` | **201**, id **3** |
| Create student | `POST /api/students` | `{"name":"Ada Eze","email":"ada@school.com","phone":"08099998888","classId":3}` | **201**, id **4** |
| Get all | `GET /api/students` | – | **200**, count 4 |
| Get one | `GET /api/students/4` | – | **200** |
| Update | `PUT /api/students/4` | `{"phone":"08099990000"}` | **200**, `updatedAt` added |
| Update teacher | `PUT /api/teachers/3` | `{"name":"Bola Adeleke-Smith"}` | **200** |
| Empty update | `PUT /api/students/4` | `{}` | **400**, "Provide at least one field to update" |
| Bad reference | `POST /api/students` | `{"name":"Test Kid","email":"test@school.com","phone":"08000000000","classId":99}` | **404**, "Class not found" |
| Invalid id | `GET /api/students/abc` | – | **400**, "ID must be a positive whole number" |
| Not found | `GET /api/students/999` | – | **404**, "Student not found" |

**SAY (on the bad reference):**
> Records have to point to things that exist. I can't put a student in a class that doesn't exist.

**SAY (on the invalid id):**
> The ID is validated before the request reaches the controller.

### 10.6 Results (use the TEACHER token)

**SAY:**
> Now I'm the teacher. Teachers can create, view and update results.

| DO | Request | Body | Expect |
|---|---|---|---|
| Create | `POST /api/results` | `{"studentId":4,"subjectId":4,"score":67,"term":"First","session":"2025/2026"}` | **201**, grade **B**, id **5** |
| Duplicate | same again | same | **409** |
| Invalid | `POST /api/results` | `{"studentId":4,"subjectId":4,"score":150,"term":"Fourth","session":"2025-2026"}` | **400**, 3 errors |
| Update | `PUT /api/results/5` | `{"score":85}` | **200**, grade becomes **A** |
| View all | `GET /api/results` | – | **200** |

**SAY (on the 201):**
> I didn't send a grade. The server calculated B from the score of 67.

**SAY (on the update):**
> After updating the score to 85, the grade was recalculated to A automatically.

### 10.7 403 Forbidden (TEACHER token)

| DO | Request | Expect |
|---|---|---|
| Delete result | `DELETE /api/results/5` | **403** |
| Delete student | `DELETE /api/students/4` | **403** |
| View teachers | `GET /api/teachers` | **403** |

**SAY:**
> The teacher is authenticated, so these aren't 401s. They're 403s, because a teacher isn't allowed to delete records or manage teachers.

### 10.8 Student access (STUDENT token)

**SAY:**
> Now I'm logged in as Tunde, a student.

| DO | Request | Body | Expect |
|---|---|---|---|
| Own profile | `GET /api/students/1` | – | **200** |
| Someone else | `GET /api/students/2` | – | **403**, "You can only view your own profile" |
| List students | `GET /api/students` | – | **200**, only his own record |
| Own class | `GET /api/classes/1` | – | **200** |
| Other class | `GET /api/classes/2` | – | **403** |
| Subjects | `GET /api/subjects` | – | **200**, all subjects |
| Own results | `GET /api/results` | – | **200**, only studentId 1 |
| Create result | `POST /api/results` | `{"studentId":1,"subjectId":1,"score":100,"term":"First","session":"2025/2026"}` | **403** |

**SAY (on the list and results):**
> Even the list endpoints are filtered, so a student only sees their own data.

**SAY (on the create):**
> And a student can't give himself 100.

### 10.9 Error handling (ADMIN token)

| DO | Request | Body | Expect |
|---|---|---|---|
| Broken JSON | `POST /api/subjects` | `{ "name": ` | **400**, "Invalid JSON in request body" |
| Unknown field | `POST /api/subjects` | `{"name":"Music","code":"MUS101","isAdmin":true}` | **400**, "Unrecognized key" |
| Unknown route | `GET /api/nothing` | – | **404**, "Route GET /api/nothing not found" |
| Delete class with students | `DELETE /api/classes/1` | – | **409**, "Cannot delete a class that still has students" |

**SAY:**
> Every error has the same shape: `success: false` and a clear message.

### 10.10 Admin deletes (ADMIN token), in this order

| DO | Request | Expect |
|---|---|---|
| Delete result | `DELETE /api/results/5` | **200** |
| Delete student | `DELETE /api/students/4` | **200** |
| Delete teacher | `DELETE /api/teachers/3` | **200** |
| Delete subject | `DELETE /api/subjects/4` | **200** |
| Delete class | `DELETE /api/classes/3` | **200** |
| Delete again | `DELETE /api/classes/3` | **404** |

**SAY:**
> The admin has full access to delete. I delete in this order because the API protects related data. A subject still used by a teacher or result can't be deleted, and neither can a class that still has students.

### 10.11 Logger

**DO:** Switch to the terminal and scroll through the log lines.

**SAY:**
> Here's the logger. Every request I made is recorded with the timestamp, method, URL and status code.

### 10.12 Rate limiting (do this last)

**DO:** Send `POST /api/auth/login` with a wrong password about 12 times quickly, until you get **429**.

**SAY:**
> Finally, rate limiting. After too many login attempts, the API returns 429, "Too many requests". This protects against brute-force attacks.

> ⚠️ After this you won't be able to log in for 15 minutes unless you restart the server. That's why it comes last.

---

## 11. Closing (≈45 sec)

**DO:** Open `README.md` in preview mode (`Ctrl+Shift+V`).

**SAY:**
> Everything is documented in the README:
> - setup steps and environment variables
> - the test accounts
> - a table of permissions per role
> - request body examples, validation rules and status codes
>
> I've also included a Postman collection that Thunder Client can import. It covers every endpoint, with tests on each request.
>
> To recap, this project has:
> - JWT authentication with bcrypt password hashing
> - role-based authorization for admin, teacher and student
> - full CRUD for all five resources, with related data
> - validation on every request
> - a global error handler, request logging and rate limiting
>
> Thank you for watching.

---

## If something goes wrong on camera

| Problem | Fix |
|---|---|
| Unexpected 401 on every request | The token expired (1 hour) or the server restarted. Log in again and paste the new token. |
| 429 on login | The rate limit was hit. Restart the server (`Ctrl+C`, then `npm run dev`). |
| IDs don't match the script (e.g. class isn't 3) | Data from an earlier run is still there. Restart the server to reset the in-memory data. |
| 400 "expected object" | Set the body type to **JSON** in Thunder Client. |
