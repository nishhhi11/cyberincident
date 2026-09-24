# Cybersecurity Incident & IT Service Management Platform

A full-stack web application for managing **IT support tickets and cybersecurity incidents** in an organized and secure way.

The platform allows employees to report issues and incidents, while support agents, security analysts, and administrators can manage, assign, update, resolve, and monitor them according to their roles.

The backend is built using **Node.js, Express.js, MongoDB, and Mongoose**, with JWT-based authentication and role-based authorization.

---

##  Project Description

The **Cybersecurity Incident & IT Service Management Platform** provides a centralized system for handling:

* IT support tickets
* Cybersecurity incidents
* Incident assignment and resolution
* Ticket SLA management
* Comments and attachments
* User roles and permissions
* Audit logging
* Incident and ticket statistics

The system follows a role-based approach so that different users have different levels of access.

---

##  Key Features

###  Authentication & Authorization

* User registration and login
* Password hashing using bcrypt
* JWT-based authentication
* Role-based authorization
* Protected API routes

###  Ticket Management

* Create IT/security tickets
* View tickets
* Search tickets
* Filter by status, priority, and category
* Assign tickets to users
* Update ticket status
* Escalate tickets
* Resolve tickets
* SLA deadline calculation

###  Incident Management

* Report cybersecurity incidents
* Set incident severity
* Track incident status
* Assign incidents to security personnel
* Resolve incidents
* Search and filter incidents
* View incident statistics

###  Comments

Users can add comments to:

* Tickets
* Incidents

###  File Attachments

The application supports file uploads for tickets and incidents using Multer.

Supported file types:

```text
.jpg
.jpeg
.png
.pdf
.txt
.log
.zip
```

Maximum file size:

```text
10 MB
```

###  Audit Logs

Important actions are recorded in the audit log, including:

* User registration
* User login
* Ticket creation
* Ticket updates
* Ticket assignment
* Ticket escalation
* Ticket resolution
* Incident reporting
* Incident updates
* Incident assignment
* Incident resolution
* Comments

###  SLA Escalation

Tickets have SLA deadlines based on priority.

| Priority |      SLA |
| -------- | -------: |
| Critical |   1 hour |
| High     |  4 hours |
| Medium   |  8 hours |
| Low      | 24 hours |

The system periodically checks tickets approaching their SLA deadline and can automatically escalate them.

---

#  User Roles

The system contains four roles:

### Employee

* Report tickets
* Report incidents
* View their own reported tickets/incidents

### Support Agent

* Manage tickets
* Update tickets
* Assign tickets
* Resolve tickets

### Security Analyst

* Manage cybersecurity incidents
* Assign incidents
* Resolve incidents
* Manage security-related tickets
* Escalate tickets
* View statistics

### Admin

* Manage users
* Change user roles
* View audit logs
* Access statistics
* Perform administrative operations

---

#  Technologies Used

## Frontend

The frontend communicates with the backend through REST APIs.

> Add your actual frontend technologies here if your frontend is included in the complete repository.

Example:

* React.js
* React Router
* CSS / Tailwind CSS
* Fetch API / Axios

## Backend

* **Node.js** — JavaScript runtime
* **Express.js** — Backend framework
* **MongoDB** — NoSQL database
* **Mongoose** — MongoDB ODM
* **JWT** — Authentication
* **bcryptjs** — Password hashing
* **Multer** — File uploads
* **node-cron** — Scheduled SLA checks
* **CORS** — Cross-origin requests

---

#  Project Structure

```text
backend/
│
├── server.js
├── package.json
│
├── config/
│   └── db.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── uploadMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Ticket.js
│   ├── Incident.js
│   ├── Comment.js
│   ├── Attachment.js
│   └── AuditLog.js
│
├── controllers/
│   ├── authController.js
│   ├── ticketController.js
│   ├── incidentController.js
│   ├── userController.js
│   └── commentController.js
│
└── routes/
    ├── authRoutes.js
    ├── ticketRoutes.js
    ├── incidentRoutes.js
    └── userRoutes.js
```

---

#  Installation

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

## 2. Open the Project

```bash
cd <PROJECT_FOLDER>
```

## 3. Install Dependencies

For the backend:

```bash
cd backend
npm install
```

---

#  Required Dependencies

The backend uses the following major packages:

```text
express
mongoose
cors
jsonwebtoken
bcryptjs
multer
node-cron
```

Install dependencies using:

```bash
npm install
```

---

#  MongoDB Configuration

The project uses MongoDB as its database.

The current backend connects to:

```text
mongodb://127.0.0.1:27017/cybersecurity_itsm_db
```

The database name is:

```text
cybersecurity_itsm_db
```

MongoDB should be running locally before starting the backend.

The connection is handled in:

```text
backend/config/db.js
```

Mongoose is used to connect the Node.js backend with MongoDB.

---

#  Running the Backend

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
node server.js
```

The backend runs on:

```text
http://localhost:8000
```

If the server starts successfully, you should see:

```text
Server is running on port 8000
```

---

#  Running the Frontend

Navigate to your frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend URL depends on the frontend configuration.

> Update this section with the exact command and URL used by your frontend before submitting the repository.

---

#  API Details

The backend follows a REST API architecture.

## Authentication

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| POST   | `/auth/register` | Register a new user |
| POST   | `/auth/login`    | Login user          |

---

## Tickets

| Method | Endpoint                | Description       |
| ------ | ----------------------- | ----------------- |
| POST   | `/tickets`              | Create ticket     |
| GET    | `/tickets`              | Get tickets       |
| GET    | `/tickets/:id`          | Get ticket by ID  |
| PUT    | `/tickets/:id`          | Update ticket     |
| PUT    | `/tickets/:id/assign`   | Assign ticket     |
| PUT    | `/tickets/:id/escalate` | Escalate ticket   |
| PUT    | `/tickets/:id/resolve`  | Resolve ticket    |
| GET    | `/tickets/stats`        | Ticket statistics |

---

## Incidents

| Method | Endpoint                 | Description         |
| ------ | ------------------------ | ------------------- |
| POST   | `/incidents`             | Report incident     |
| GET    | `/incidents`             | Get incidents       |
| GET    | `/incidents/:id`         | Get incident by ID  |
| PUT    | `/incidents/:id`         | Update incident     |
| PUT    | `/incidents/:id/assign`  | Assign incident     |
| PUT    | `/incidents/:id/resolve` | Resolve incident    |
| GET    | `/incidents/stats`       | Incident statistics |

---

## Users

| Method | Endpoint            | Description      |
| ------ | ------------------- | ---------------- |
| GET    | `/users`            | Get all users    |
| GET    | `/users/:id`        | Get user by ID   |
| PUT    | `/users/:id/role`   | Update user role |
| GET    | `/users/audit-logs` | View audit logs  |

---

#  Authentication Flow

The application uses **JSON Web Tokens (JWT)**.

### Login Flow

```text
User
 ↓
Login Request
 ↓
Backend
 ↓
Check User
 ↓
Compare Password using bcrypt
 ↓
Generate JWT
 ↓
Return Token
 ↓
Frontend stores token
```

For protected requests:

```text
Frontend
 ↓
JWT Token
 ↓
authMiddleware
 ↓
jwt.verify()
 ↓
req.user
 ↓
Controller
```

The JWT contains:

```javascript
{
    id: user._id,
    role: user.role,
    name: user.name
}
```

---

#  Role-Based Authorization

The application uses middleware to restrict certain operations according to the user's role.

Example:

```javascript
roleMiddleware("admin", "security_analyst")
```

This means only users with the specified roles can access that route.

Authentication answers:

> **Who is the user?**

Authorization answers:

> **What is the user allowed to do?**

---

#  Search & Pagination

Tickets and incidents support:

* Search
* Filtering
* Pagination
* Sorting

Example search uses MongoDB regular expressions:

```javascript
{
    title: {
        $regex: search,
        $options: "i"
    }
}
```

`$options: "i"` makes the search **case-insensitive**.

Pagination uses:

```javascript
skip = (page - 1) * limit
```

---

#  Statistics

The backend uses MongoDB's **aggregation framework** to generate statistics.

For example, tickets can be grouped by:

* Status
* Priority

Incidents can be grouped by:

* Status
* Severity

The `$group` aggregation stage is used to calculate the counts.

---

# 📎 File Uploads

Multer handles file uploads.

Uploaded files are stored in:

```text
uploads/
```

The backend restricts uploads by:

* File extension
* File size

Maximum size:

```text
10 MB
```

---

#  Audit Logging

The system maintains an `AuditLog` collection.

Each audit entry can contain:

```text
action
performedBy
targetCollection
targetId
details
createdAt
```

This provides a record of important activities performed within the system.

---

#  Unique Features Implemented

The following features make the project more than a basic CRUD application:

### 1. Role-Based Access Control

Different roles have different permissions for tickets, incidents, statistics, and user management.

### 2. SLA-Based Ticket Management

Ticket deadlines are automatically calculated according to priority.

```text
Critical → 1 hour
High → 4 hours
Medium → 8 hours
Low → 24 hours
```

### 3. Automatic SLA Escalation

A scheduled job runs every 15 minutes and checks tickets approaching their SLA deadline.

### 4. Cybersecurity Incident Management

Separate incident management allows security-related incidents to be reported, assigned, investigated, and resolved.

### 5. Audit Trail

Important user and system actions are stored in the AuditLog collection.

### 6. Secure Password Storage

Passwords are hashed using `bcryptjs` rather than being stored as plain text.

### 7. Search, Filtering & Pagination

Users can search and filter tickets and incidents while pagination keeps large result sets manageable.

---

#  Screenshots

Add screenshots of your actual application here.

Example:

### Login Page

```text
![Login Page](screenshots/login.png)
```

### Dashboard

```text
![Dashboard](screenshots/dashboard.png)
```

### Ticket Management

```text
![Ticket Management](screenshots/tickets.png)
```

### Incident Management

```text
![Incident Management](screenshots/incidents.png)
```

### User Management

```text
![User Management](screenshots/users.png)
```

> Replace these paths with the actual screenshot filenames in your repository.

---

# 📁 Recommended Screenshot Folder

```text
screenshots/
├── login.png
├── dashboard.png
├── tickets.png
├── incidents.png
└── users.png
```

---

#  Assumptions & Limitations

* MongoDB is configured as a local MongoDB instance.
* The backend currently uses a local database connection.
* Uploaded files are stored on the server.
* The application requires the backend and MongoDB service to be running.
* JWT authentication is required for protected API routes.
* Some API operations are restricted according to user roles.
* Frontend-specific commands and technologies should be updated according to the final frontend implementation.
* API secrets and database credentials should ideally be stored using environment variables in a production deployment.

---

#  Application Flow

```text
                ┌──────────────┐
                │   Frontend   │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Express API  │
                └──────┬───────┘
                       │
                       ▼
              ┌──────────────────┐
              │   Middleware     │
              │ JWT + Role Check │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   Controllers    │
              │  Business Logic  │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Mongoose Models  │
              └────────┬─────────┘
                       │
                       ▼
                ┌──────────────┐
                │   MongoDB    │
                └──────────────┘
```

---

#  Author

**Nandeni Tiwari**
**Nishi Chopda**
**Paarshvi Vijoy**
**Akshara Tanted**

B.Tech Computer Science Engineering

---

# 📚 Learning Outcomes

Through this project, the following concepts were implemented and practiced:

* REST API development
* Node.js
* Express.js
* MongoDB
* Mongoose
* CRUD operations
* JWT authentication
* Role-based authorization
* Password hashing
* Middleware
* File uploads
* MongoDB aggregation
* Pagination
* Search and filtering
* SLA management
* Scheduled tasks
* Audit logging
* Backend project architecture

---

## 🚀 Project Status

**Status:** Completed / Academic Project

This project was developed as a full-stack cybersecurity incident and IT service management application.
