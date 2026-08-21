# 📚 Smart Library Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vite.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0+-06B6D4.svg?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/Neon_PostgreSQL-Serverless-4169E1.svg?style=flat&logo=postgresql&logoColor=white)](https://neon.tech/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00.svg?style=flat&logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![Render](https://img.shields.io/badge/Render-Deployed-46E3B7.svg?style=flat&logo=render&logoColor=black)](https://render.com/)

A modern, full-stack digital library management system built with **FastAPI**, **React 19**, **SQLAlchemy 2.0**, and **PostgreSQL (Neon)**. Designed for college students and library administrators to automate book cataloging, self-service borrowing with automated due-date scheduling, overdue fine calculations, reservation queues, and administrative analytics.

---

## 🔗 Live Demo & Quick Links

| Service | Link | Purpose |
| :--- | :--- | :--- |
| **Frontend Application** | [smart-library-system-3rby.onrender.com](https://smart-library-system-3rby.onrender.com) | Responsive web portal for Students & Administrators |
| **Backend REST API** | [smart-library-backend-pbl6.onrender.com](https://smart-library-backend-pbl6.onrender.com) | FastAPI backend service |
| **Interactive API Docs (Swagger)** | [smart-library-backend-pbl6.onrender.com/docs](https://smart-library-backend-pbl6.onrender.com/docs) | Interactive Swagger UI for exploring and testing API endpoints |
| **Alternative API Docs (ReDoc)** | [smart-library-backend-pbl6.onrender.com/redoc](https://smart-library-backend-pbl6.onrender.com/redoc) | Clean, structured OpenAPI documentation |

---

## 💡 Why This Project?

Traditional campus libraries often rely on manual register entries or fragmented desktop applications that make tracking inventory and checkout deadlines cumbersome. 

This project solves those challenges by providing:
- **Centralized Circulation**: Real-time synchronization between student borrowing, book return workflows, and physical shelf inventory.
- **Automated Deadline & Fine Management**: Transparent 14-day loan schedules with automatic overdue fine computation on late returns.
- **Hold Queue Automation**: Reservation queues for high-demand, out-of-stock publications.
- **Secure Access Separation**: Role-Based Access Control (RBAC) guaranteeing that students can only manage their own loans while administrators have full oversight.

---

## ✨ Key Features

### 🎓 Student Portal
- **Account Registration & Login**: Self-service student registration with secure JWT authentication.
- **Catalog Exploration**: Browse library books with live stock status, categories, and physical shelf locations.
- **Search & Multi-Filtering**: Instant keyword search (by title or author) combined with filters for category, shelf rack, and availability.
- **Live Inventory Breakdown**: Transparent view displaying both total copies owned and copies currently available.
- **Self-Service Borrowing**: 14-day checkout with automated due-date calculation and inventory adjustments.
- **Circulation History**: View active and completed loans, checkout dates, return deadlines, and return statuses.
- **Reservation Queue**: Place holds on out-of-stock publications to claim priority when copies are returned.
- **Hold Management**: View active reservation statuses and cancel pending holds.
- **Fine Settlement**: Check accumulated overdue fees and settle outstanding balances directly in the portal.
- **Personalized Desk**: Student dashboard summarizing active checkouts, hold positions, and pending dues.
- **Profile & Settings**: View account information, assigned role, and manage interface preferences.

### 🛡️ Administrator Portal
- **Administrative Authentication**: Role-verified access protected via JWT claims.
- **Catalog Management (CRUD)**: Add new books, update title details, reassign shelf locations, and adjust physical copy quantities.
- **Circulation Ledger**: Global view of all active and returned loans across the student body with joined user metadata.
- **Reservation Holds Ledger**: Monitor student hold queues across all catalog titles.
- **Fine Ledger & Manual Assessment**: Review student penalty records, track settlement status, and assess manual fines when necessary.
- **Dashboard Telemetry**: Real-time analytics displaying total members, catalog volume, active checkouts, hold counts, and outstanding fine balances.

---

## 📦 Book Availability System

The library platform implements a two-tier inventory tracking model to prevent inventory drift:

- **Total Quantity (`total_quantity`)**: The total number of physical copies owned by the library institution. This value represents total assets and **does not decrease** during normal student checkouts.
- **Available Quantity (`available_quantity`)**: The number of copies currently sitting on the shelf ready for checkout. This value decrements upon borrow and increments upon return.

### Lifecycle Example:

```
1. Initial State:
   [Clean Code]  ──▶  Total: 2  │  Available: 2

2. Student Borrows 1 Copy:
   [Clean Code]  ──▶  Total: 2  │  Available: 1  (available decremented by 1)

3. Second Student Borrows 1 Copy:
   [Clean Code]  ──▶  Total: 2  │  Available: 0  (Book is now Out of Stock)
   • Borrow action is automatically disabled in UI
   • Reservation button becomes available ("Place Hold")

4. Student Returns 1 Copy:
   [Clean Code]  ──▶  Total: 2  │  Available: 1  (available incremented by 1)
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) (Single Page Application architecture)
- **Build Tool**: [Vite 8](https://vite.dev/) (Fast Hot Module Replacement)
- **Routing**: [React Router 7](https://reactrouter.com/) (Declarative client-side routing & route guards)
- **HTTP Client**: [Axios](https://axios-http.com/) (Configured with request interceptors for JWT token injection and dynamic API base URL resolution)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) (Modern utility-first responsive layout)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/) (Interactive circulation metrics)

### Backend
- **Framework**: [FastAPI 0.115+](https://fastapi.tiangolo.com/) (Modern, asynchronous Python REST API framework)
- **Server**: [Uvicorn](https://www.uvicorn.org/) (Standard ASGI web server)
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (Object-relational mapping, declarative models, connection pooling)
- **Data Validation**: [Pydantic v2](https://docs.pydantic.dev/) & [pydantic-settings](https://pypi.org/project/pydantic-settings/)

### Authentication & Security
- **JWT Authentication**: [python-jose](https://python-jose.readthedocs.io/) (`HS256` token encoding, decoding, and expiration enforcement)
- **Password Hashing**: [bcrypt](https://pypi.org/project/bcrypt/) (Direct cryptographic hashing with per-user salt generation and safe 72-byte handling)
- **Authorization**: Custom FastAPI dependency injection (`get_current_user`, `require_admin`) enforcing Role-Based Access Control
- **CORS**: FastAPI `CORSMiddleware` configured with allowed production and development origins with credential support

### Database
- **Production**: [Neon Serverless PostgreSQL](https://neon.tech/) (Connected via `psycopg2-binary` with SSL pooling)
- **Local Development**: [MySQL 8.0+](https://www.mysql.com/) (Connected via `PyMySQL`) / SQLite in-memory for testing

### Deployment & Infrastructure
- **Cloud Hosting**: [Render](https://render.com/) (Frontend Static Site + Backend Web Service)
- **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) (Multi-stage builds and local orchestration)

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  React 19 Frontend (SPA)                    │
│    (TailwindCSS v4 • Lucide Icons • React Router 7)         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                  HTTPS REST API Requests
             (Authorization: Bearer <JWT Token>)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend API                       │
│  ┌────────────────────────┐     ┌────────────────────────┐  │
│  │    CORS Middleware     │     │     JWT Auth / RBAC    │  │
│  │ (Allowed Origins List) │     │ (Roles: student/admin) │  │
│  └───────────┬────────────┘     └───────────┬────────────┘  │
│              │                              │               │
│  ┌───────────▼──────────────────────────────▼────────────┐  │
│  │                    API Routers                        │  │
│  │  /users  •  /books  •  /borrow  •  /reservations      │  │
│  │  /fines  •  /dashboard  •  /admin                     │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                              │
│  ┌───────────────────────────▼───────────────────────────┐  │
│  │                 SQLAlchemy 2.0 ORM                    │  │
│  │        (Session Management • Declarative Models)      │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │
                   SQLAlchemy Connection Pool
                   (psycopg2-binary / PyMySQL)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Tier                          │
│   • Production: Neon Serverless PostgreSQL (Cloud / SSL)    │
│   • Local Dev:  MySQL 8.0+ / SQLite In-Memory               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Documentation

All protected endpoints require an `Authorization: Bearer <JWT_ACCESS_TOKEN>` header.

### 1. Authentication & User Management (`/users`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/users/register` | Public | Register a new student account (role is locked to `student`) |
| `POST` | `/users/login` | Public | Authenticate user credentials and return a signed JWT access token |
| `GET` | `/users/me` | Authenticated | Retrieve current user's profile and assigned role |
| `GET` | `/users/` | Admin Only | Retrieve list of all registered library users |

### 2. Catalog & Book Management (`/books`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/books/` | Authenticated | List all books with optional search, category, rack, and availability filters |
| `GET` | `/books/search` | Authenticated | Search books by keyword matching in title or author |
| `GET` | `/books/{book_id}` | Authenticated | Retrieve complete details for a single book by ID |
| `POST` | `/books/` | Admin Only | Add a new book title and initial quantity to the catalog |
| `PUT` | `/books/{book_id}` | Admin Only | Update book metadata, shelf location, or quantities |
| `DELETE` | `/books/{book_id}` | Admin Only | Delete a book record from the catalog |

### 3. Circulation & Borrowing (`/borrow`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/borrow/` | Authenticated | Issue a book copy to student (sets 14-day due date, decrements available count) |
| `PUT` | `/borrow/{borrow_id}/return` | Authenticated | Return a borrowed book (increments available count, computes overdue fine if late) |
| `GET` | `/borrow/user/{user_id}` | Authenticated | Retrieve borrowing history and active loans for a specific student |
| `GET` | `/borrow/` | Admin Only | View all circulation records with joined student and book metadata |

### 4. Reservation Queue (`/reservations`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/reservations/` | Authenticated | Place a reservation hold on an out-of-stock book |
| `GET` | `/reservations/user/{user_id}` | Authenticated | View active reservation holds placed by a user |
| `DELETE` | `/reservations/{reservation_id}` | Authenticated | Cancel an active reservation hold |
| `GET` | `/reservations/` | Admin Only | View all reservation holds across the institution |

### 5. Fines & Penalty Management (`/fines`)
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/fines/user/{user_id}` | Authenticated | View all fines and payment status for a specific user |
| `PUT` | `/fines/{fine_id}/pay` | Authenticated | Settle an outstanding fine balance (marks `paid = True`) |
| `POST` | `/fines/` | Admin Only | Manually assess a penalty fine for a student |
| `GET` | `/fines/` | Admin Only | View global fine records across all library members |

### 6. Analytics & System Health
| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/stats` | Authenticated | Aggregated metrics for total users, books, active checkouts, holds, and fines |
| `GET` | `/admin/dashboard` | Admin Only | Administrative overview counters |
| `GET` | `/health` | Public | System and database connectivity health check |
| `GET` | `/` | Public | Service liveness indicator |

---

## 🔒 Authentication & Security Implementation

1. **Direct bcrypt Password Hashing**:
   - Plaintext passwords are never saved to the database.
   - Passwords are salted and hashed using `bcrypt.hashpw(password.encode('utf-8')[:72], bcrypt.gensalt())`.
   - The 72-byte string limit of bcrypt is handled safely to prevent truncation errors.
2. **Stateless JWT Tokens**:
   - Authentication returns a signed JSON Web Token using `HS256`.
   - Tokens carry the subject (`user_id`), user email, role (`student` or `admin`), and expiration timestamp.
3. **Role-Based Access Control (RBAC)**:
   - FastAPI dependency `get_current_user` extracts and validates the token on every protected route.
   - Administrative endpoints use `require_admin` to restrict access strictly to users with `role == 'admin'`.
   - Public user registration (`/users/register`) permanently enforces `role = 'student'` to prevent privilege escalation.
4. **CORS Security**:
   - Configured via FastAPI's `CORSMiddleware`.
   - Sanitizes origins and disallows dangerous wildcards (`*`) when credentials (`allow_credentials=True`) are enabled.
5. **Environment Isolation**:
   - Database credentials, JWT secret keys, token expiration times, loan durations, and fine rates are externalized via environment variables.

---

## 🗄️ Database Architecture

The relational schema consists of 5 interconnected tables managed through SQLAlchemy declarative models:

```
 ┌──────────────────────────┐               ┌──────────────────────────┐
 │          users           │               │          books           │
 ├──────────────────────────┤               ├──────────────────────────┤
 │ user_id   (INT, PK)      │               │ book_id   (INT, PK)      │
 │ name      (VARCHAR)      │               │ title     (VARCHAR)      │
 │ email     (VARCHAR, UNQ) │               │ author    (VARCHAR)      │
 │ password  (VARCHAR)      │               │ category  (VARCHAR)      │
 │ role      (VARCHAR)      │               │ rack_loc  (VARCHAR)      │
 └─────────────┬────────────┘               │ total_qty (INT)          │
               │                            │ avail_qty (INT)          │
               │ 1:N                        └─────────────┬────────────┘
               ├────────────────────────────┐             │ 1:N
               │                            │             │
               ▼                            ▼             ▼
 ┌──────────────────────────┐         ┌──────────────────────────┐
 │          fines           │         │          borrow          │
 ├──────────────────────────┤         ├──────────────────────────┤
 │ fine_id   (INT, PK)      │         │ borrow_id   (INT, PK)    │
 │ user_id   (INT, FK)      │         │ user_id     (INT, FK)    │
 │ amount    (FLOAT)        │         │ book_id     (INT, FK)    │
 │ paid      (BOOLEAN)      │         │ issue_date  (DATE)       │
 └──────────────────────────┘         │ due_date    (DATE)       │
                                      │ return_date (DATE)       │
               ┌──────────────────────┤ returned    (BOOLEAN)    │
               │                      └──────────────────────────┘
               ▼ 1:N
 ┌──────────────────────────┐
 │       reservations       │
 ├──────────────────────────┤
 │ reservation_id (INT, PK) │
 │ user_id        (INT, FK) │
 │ book_id        (INT, FK) │
 │ status         (VARCHAR) │
 └──────────────────────────┘
```

### Table Specifications:
- **`users`**: Contains registered student and administrator profiles, credentials, and access roles (`admin`, `student`).
- **`books`**: Stores catalog entries with title, author, category, rack location, and inventory counts (`total_quantity`, `available_quantity`).
- **`borrow`**: Records individual borrowing transactions with checkout issue dates, 14-day due dates, actual return dates, and completion status.
- **`reservations`**: Manages hold queues for out-of-stock publications with status tracking (`reserved`, `cancelled`).
- **`fines`**: Tracks overdue loan penalty assessments and manual administrative fees with payment status (`paid = False/True`).

---

## ☁️ Production Deployment Architecture

The application is deployed across **Render** and **Neon**:

1. **Frontend (Render Static Site)**:
   - Built from source using `npm run build` (Vite production bundle).
   - Deployed at `https://smart-library-system-3rby.onrender.com`.
   - Configured with a single SPA rewrite rule (`Source: /*` → `Destination: /index.html`) so client-side React Router navigation works on direct URL access and page refreshes.
2. **Backend (Render Web Service)**:
   - Deployed at `https://smart-library-backend-pbl6.onrender.com`.
   - FastAPI application served via Uvicorn.
   - Uses an automated lifespan handler that creates tables upon startup and idempotently seeds initial catalog books if the catalog is empty.
3. **Database (Neon Serverless PostgreSQL)**:
   - Hosted cloud PostgreSQL database with automated connection pooling and SSL encryption.
   - Connected via `psycopg2-binary` driver with automatic URL normalization.
4. **CORS Configuration**:
   - Explicitly allows the production frontend URL (`https://smart-library-system-3rby.onrender.com`) for authenticated HTTP requests.

---

## 💻 Local Development Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**
- **MySQL 8.0+** (or Docker)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/prathampoojari13/Smart-Library-System.git
cd Smart-Library-System
```

---

### Step 2: Backend Setup

1. Open the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell):
   python -m venv venv
   .\venv\Scripts\activate

   # Linux / macOS:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Update database credentials in `backend/.env` to match your local database instance).*

5. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - API Endpoint: `http://localhost:8000`
   - Interactive Swagger Docs: `http://localhost:8000/docs`

---

### Step 3: Frontend Setup

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Configure frontend environment variables (optional for default `http://localhost:8000`):
   ```bash
   cp .env.example .env
   ```

4. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   - Frontend Application: `http://localhost:5173`

---

### Step 4: Docker Compose Setup (Optional)

To spin up the entire multi-container environment (MySQL 8.0 database + FastAPI backend + React/Nginx frontend) in one step:

```bash
docker compose up -d --build
```

- Frontend App: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`

To shut down containers:
```bash
docker compose down
```

---

## 🧪 Testing & Verification

The project includes an automated test verification suite covering all core business logic and security policies:

```bash
cd backend
python test_system.py
```

### Actual Test Suite Results:
```text
=================================================================
 SMART LIBRARY SYSTEM - PHASE 1 & 2 VERIFICATION SUITE
=================================================================
[TEST 1] Testing Config & JWT Security... PASSED
[TEST 2] Testing User Registration & Role Enforcement... PASSED
[TEST 3] Testing User Login & /users/me endpoint... PASSED
[TEST 4] Testing Book Management & Role Permissions... PASSED
[TEST 4B] Testing Phase 3 Book Search & Multi-Filters... PASSED
[TEST 5] Testing Borrowing Flow & 14-Day Due Date... PASSED
[TEST 6] Testing Overdue Fine Calculation on Return... PASSED
[TEST 7] Testing Fine Payment Flow... PASSED
[TEST 8] Testing Admin Listings (/fines/, /borrow/, /reservations/)... PASSED
[TEST 9] Testing Reservation Cancellation & User History... PASSED
[TEST 10] Testing Dashboard Analytics... PASSED
=================================================================
 ALL 11 INTEGRATION & SECURITY TESTS PASSED SUCCESSFULLY! 
=================================================================
```

Frontend production build verification:
```bash
cd frontend
npm run build
```

---

## 📂 Project Structure

```
Smart-Library-System/
├── backend/
│   ├── app/
│   │   ├── models/            # SQLAlchemy database models (user, book, borrow, reservation, fine)
│   │   ├── routes/            # FastAPI API routers (users, book, borrow, reservation, fine, admin, dashboard)
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── utils/             # Password hashing (bcrypt), JWT utilities, RBAC dependencies, seed data
│   │   ├── config.py          # Centralized settings & database URL normalizer
│   │   ├── database.py        # SQLAlchemy engine, session maker, connection check
│   │   └── main.py            # FastAPI application factory, CORS, and lifespan events
│   ├── .env.example           # Backend environment template
│   ├── Dockerfile             # Backend Python container image
│   ├── requirements.txt       # Python dependencies
│   ├── reset_admin_user.py    # Admin password reset utility script
│   └── test_system.py         # End-to-end integration & security verification suite
├── frontend/
│   ├── public/                # Static assets (favicon.svg, favicon.ico, icons.svg)
│   ├── src/
│   │   ├── api/               # Axios API client with dynamic base URL & JWT interceptor
│   │   ├── components/        # UI components (Navbar, Sidebar, StatCard, Toast, DashboardChart, etc.)
│   │   ├── context/           # React context providers (ToastContext, confirmation dialogs)
│   │   ├── pages/             # Application views (Dashboard, Books, Borrow, Reservations, Fines, Admin views)
│   │   ├── utils/             # Client-side session and auth helper functions
│   │   ├── App.jsx            # React Router route declarations and role guards
│   │   ├── index.css          # Global Tailwind CSS styles and theme tokens
│   │   └── main.jsx           # React application entry point
│   ├── .env.example           # Frontend environment template
│   ├── Dockerfile             # Multi-stage Vite build + Nginx Alpine image
│   ├── nginx.conf             # Production Nginx reverse proxy configuration
│   ├── package.json           # Frontend dependencies and npm scripts
│   └── vite.config.js         # Vite configuration with React and Tailwind plugins
├── database/
│   └── init.sql               # Database schema initialization and seed reference data
├── docker-compose.yml         # Full-stack multi-container Docker orchestration
├── .gitignore                 # Git ignore rules
└── README.md                  # Comprehensive project documentation
```

---

## 📸 Screenshots

*(Visual documentation placeholders for project presentations and portfolio showcases)*

| Page / Interface | Description | Placeholder |
| :--- | :--- | :--- |
| **Authentication** | User Login & Registration with JWT token generation | *[ Screenshot: Login / Registration View ]* |
| **Student Dashboard** | Member summary with active checkouts and overdue alerts | *[ Screenshot: Student Dashboard ]* |
| **Book Catalog** | Catalog search with real-time availability and multi-filtering | *[ Screenshot: Book Catalog View ]* |
| **Borrowing & Circulation** | Active student loans with 14-day return deadlines | *[ Screenshot: Borrowing Records View ]* |
| **Reservation Queue** | Hold management for out-of-stock publications | *[ Screenshot: Reservations View ]* |
| **Fine Settlement** | Fine balance summary and fee payment confirmation | *[ Screenshot: Fines Management View ]* |
| **Admin Dashboard** | Institutional telemetry counters and catalog CRUD controls | *[ Screenshot: Administrator Console ]* |

---

## 🔮 Future Improvements

The following features represent potential future enhancements for the platform:
- **Payment Gateway Integration**: Direct online fine settlement via Stripe or Razorpay.
- **Automated Notifications**: Automated email and SMS alerts for upcoming return deadlines and overdue fines.
- **Barcode & QR Code Scanning**: Mobile camera integration for rapid physical checkout and book check-in.
- **AI Book Recommendation Engine**: Personalized book suggestions based on student borrowing trends.
- **Mobile Application**: Cross-platform mobile client built using React Native.

---

## 👨‍💻 Author

**Pratham K**  
*Department of Computer Science and Engineering*  
*BMS Institute of Technology and Management*

---

## 📄 License

This project currently has no explicit open-source license. All rights reserved.
