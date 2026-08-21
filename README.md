# 📚 Smart Library Management System

A production-ready, full-stack digital library platform designed for academic institutions, college students, and library administrators. The platform streamlines book discovery, automated circulation with loan deadline tracking, overdue fine calculation, reservation hold queues, and administrative catalog management through a modern, responsive interface.

---

## 🌐 Live Demo

| Component | Deployment URL | Description |
| :--- | :--- | :--- |
| **Frontend Application** | [smart-library-system-3rby.onrender.com](https://smart-library-system-3rby.onrender.com) | Responsive React SPA with Student & Admin portals |
| **Backend REST API** | [smart-library-backend-pbl6.onrender.com](https://smart-library-backend-pbl6.onrender.com) | FastAPI backend service with automated lifespan seed |
| **Interactive API Docs** | [smart-library-backend-pbl6.onrender.com/docs](https://smart-library-backend-pbl6.onrender.com/docs) | Interactive Swagger UI for testing API endpoints |
| **Alternative API Docs** | [smart-library-backend-pbl6.onrender.com/redoc](https://smart-library-backend-pbl6.onrender.com/redoc) | ReDoc API specifications |

---

## ✨ Key Features

### 🎓 Student Portal
- **User Registration & Login**: Self-service student registration with secure JWT authentication.
- **Browse Library Catalog**: View all academic publications with category badges, shelf location, and live stock counts.
- **Search & Multi-Filter**: Search by title or author, with dynamic filters for category, shelf rack, and availability status.
- **Book Availability Display**: Transparent view of total owned copies versus currently available copies.
- **Automated Borrowing**: Self-service 14-day checkout with automatic loan period and return deadline calculation.
- **Borrow History & Deadlines**: Track active loans, issue dates, due dates, return dates, and overdue status.
- **Book Reservation Queue**: Place a hold on out-of-stock publications to claim priority when returned.
- **Reservation Management**: View and cancel active reservation holds at any time.
- **Fine Management**: View assessed overdue fines and settle pending fees directly within the portal.
- **Student Dashboard**: Personalized desk summary with active loans, reservations, and fee balances.
- **Profile Management**: View personal account details, role assignments, and member information.

### 🛡️ Administrator Portal
- **Role-Based Authorization**: Protected administrative routes enforced via cryptographic JWT claims.
- **Catalog Management**: Add new publications, update metadata, edit shelf locations, and adjust inventory quantities.
- **Circulation Oversight**: View comprehensive records of all active and completed loans across the student body.
- **Reservation Holds Ledger**: Monitor global student hold queues by publication.
- **Fine Ledger & Audit**: View all student fines, track payment statuses, and manually assess penalty fees.
- **Admin Dashboard Analytics**: Real-time counters and aggregated metrics for registered members, catalog titles, active borrowings, hold queues, and outstanding fines.

---

## 📊 Book Availability System

The library platform implements a two-tier inventory tracking system:

- **Total Quantity (`total_quantity`)**: The total physical copies owned by the library institution. This value represents total inventory capacity and **never decreases** during normal student borrowing.
- **Available Quantity (`available_quantity`)**: The number of physical copies currently on the shelf and ready to be borrowed. This value decreases by 1 when a book is checked out and increases by 1 when returned.

### Lifecycle Example:
$$\text{Initial State:}\quad \mathbf{\text{Total: } 2 \mid \text{Available: } 2}$$
$$\text{Student Borrows 1 Copy:}\quad \mathbf{\text{Total: } 2 \mid \text{Available: } 1}$$
$$\text{Student Returns the Copy:}\quad \mathbf{\text{Total: } 2 \mid \text{Available: } 2}$$

> **Key Rule**: `total_quantity` remains constant throughout standard checkout lifecycles; only `available_quantity` increments or decrements. If `available_quantity` reaches `0`, the Borrow action is automatically disabled and students are prompted to place a reservation hold.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) (Single Page Application)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/) (Client-side declarative routing)
- **HTTP Client**: [Axios](https://axios-http.com/) (Custom interceptors for JWT injection & environment-aware base URL resolution)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)

### Backend
- **Language**: [Python 3.11+](https://www.python.org/)
- **API Framework**: [FastAPI](https://fastapi.tiangolo.com/) (High-performance, async-ready REST framework)
- **Web Server**: [Uvicorn](https://www.uvicorn.org/) (ASGI server)
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (Declarative mapping & resilient connection pooling)
- **Authentication**: [python-jose](https://python-jose.readthedocs.io/) (JWT creation and verification)
- **Password Security**: [bcrypt](https://pypi.org/project/bcrypt/) (Direct cryptographic hashing with salt generation & 72-byte safe handling)
- **Data Validation**: [Pydantic v2](https://docs.pydantic.dev/) & [pydantic-settings](https://pypi.org/project/pydantic-settings/)

### Database
- **Production**: [Neon Serverless PostgreSQL](https://neon.tech/) (Connected via `psycopg2-binary` with SSL pooling)
- **Local Development**: [MySQL 8.0+](https://www.mysql.com/) (Connected via `PyMySQL`) / SQLite in-memory for testing

### Deployment & DevOps
- **Cloud Platform**: [Render](https://render.com/) (Backend Web Service + Frontend Static Site with SPA rewrites)
- **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              React 19 Single Page App                   │
│        (TailwindCSS v4 • Lucide • React Router 7)       │
└───────────────────────────┬─────────────────────────────┘
                            │
               HTTPS / JSON REST API Requests
             (Bearer JWT Authorization Header)
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 FastAPI Backend Service                 │
│  ┌────────────────────┐         ┌────────────────────┐  │
│  │   CORS Middleware  │         │   JWT & RBAC Auth  │  │
│  └─────────┬──────────┘         └─────────┬──────────┘  │
│            │                              │             │
│  ┌─────────▼──────────────────────────────▼──────────┐  │
│  │      API Routers (/users, /books, /borrow, etc.)  │  │
│  └────────────────────────┬──────────────────────────┘  │
│                           │                             │
│  ┌────────────────────────▼──────────────────────────┐  │
│  │           SQLAlchemy 2.0 ORM Layer                │  │
│  │       (Engine Pool • Declarative Models)          │  │
│  └────────────────────────┬──────────────────────────┘  │
└───────────────────────────┼─────────────────────────────┘
                            │
              SQLAlchemy Dialect Connection
               (psycopg2-binary / PyMySQL)
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│               Relational Database Layer                 │
│   • Production: Neon PostgreSQL (Serverless / SSL)      │
│   • Local Dev:  MySQL 8.0+ / SQLite In-Memory          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 API Modules & Endpoints

All protected endpoints require an `Authorization: Bearer <token>` header.

### 1. Authentication & Users (`/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/users/register` | Public | Register a new student account (role permanently forced to `student`) |
| `POST` | `/users/login` | Public | Authenticate with email & password to receive a JWT access token |
| `GET` | `/users/me` | Authenticated | Retrieve current user profile and role details |
| `GET` | `/users/` | Admin Only | List all registered library users |

### 2. Catalog & Books (`/books`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/books/` | Authenticated | List all books with optional search, category, rack, and availability filters |
| `GET` | `/books/search` | Authenticated | Search books by keyword in title or author |
| `GET` | `/books/{book_id}` | Authenticated | Retrieve detailed information for a single book |
| `POST` | `/books/` | Admin Only | Add a new book to the catalog |
| `PUT` | `/books/{book_id}` | Admin Only | Update book details, rack location, and quantities |
| `DELETE` | `/books/{book_id}` | Admin Only | Remove a book from the catalog |

### 3. Circulation & Borrowing (`/borrow`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/borrow/` | Authenticated | Check out a book (14-day due date, decrements `available_quantity`) |
| `PUT` | `/borrow/{borrow_id}/return` | Authenticated | Return a book (increments `available_quantity`, assesses overdue fine if late) |
| `GET` | `/borrow/user/{user_id}` | Authenticated | View borrowing history for a specific user |
| `GET` | `/borrow/` | Admin Only | View global circulation records with joined user and book metadata |

### 4. Reservation Queue (`/reservations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/reservations/` | Authenticated | Place a reservation hold on an out-of-stock book |
| `GET` | `/reservations/user/{user_id}` | Authenticated | View active reservation holds for a user |
| `DELETE` | `/reservations/{reservation_id}` | Authenticated | Cancel an active reservation hold |
| `GET` | `/reservations/` | Admin Only | View all reservation holds across the institution |

### 5. Fines & Fee Settlement (`/fines`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/fines/user/{user_id}` | Authenticated | Retrieve fine balance and payment history for a user |
| `PUT` | `/fines/{fine_id}/pay` | Authenticated | Mark an outstanding fine as paid |
| `POST` | `/fines/` | Admin Only | Manually assess a fine against a student |
| `GET` | `/fines/` | Admin Only | View all fine records across all library members |

### 6. Analytics & Telemetry
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/stats` | Authenticated | Aggregated metrics for members, books, active loans, holds, and fines |
| `GET` | `/admin/dashboard` | Admin Only | Administrative overview counters |
| `GET` | `/health` | Public | Application and database connection health check |
| `GET` | `/` | Public | Service liveness indicator |

---

## 🔒 Authentication & Security

- **Cryptographic Password Hashing**: Passwords are never stored in plaintext. Hashing is executed via **direct bcrypt** with per-user salt generation (`bcrypt.gensalt()`) and safe 72-byte string handling.
- **JWT Token Authentication**: Stateless session management signed via `HS256` containing encoded user claims (`user_id`, `email`, `role`, and expiration timestamp).
- **Role-Based Access Control (RBAC)**: Fine-grained authorization guards API endpoints. Public registration is locked to the `student` role; all catalog modification, manual fine assessments, and global oversight routes strictly require `admin`.
- **CORS Protection**: Explicit Cross-Origin Resource Sharing (`CORSMiddleware`) configured with allowed production and development origins, credentials support (`allow_credentials=True`), and allowed HTTP methods.
- **Zero Hardcoded Secrets**: All cryptographic keys, database URLs, expiration durations, and fine rates are externalized via environment variables.

---

## 🗄️ Database Architecture

The relational schema consists of 5 interconnected tables managed via SQLAlchemy declarative models:

```
  ┌─────────────────────────┐               ┌─────────────────────────┐
  │          users          │               │          books          │
  ├─────────────────────────┤               ├─────────────────────────┤
  │ user_id (PK)            │               │ book_id (PK)            │
  │ name                    │               │ title                   │
  │ email (UNIQUE)          │               │ author                  │
  │ password                │               │ category                │
  │ role                    │               │ rack_location           │
  └────────────┬────────────┘               │ total_quantity          │
               │                            │ available_quantity      │
               │ 1:N                        └────────────┬────────────┘
               ├───────────────────────────┐             │ 1:N
               │                           │             │
               ▼                           ▼             ▼
  ┌─────────────────────────┐         ┌─────────────────────────┐
  │          fines          │         │         borrow          │
  ├─────────────────────────┤         ├─────────────────────────┤
  │ fine_id (PK)            │         │ borrow_id (PK)          │
  │ user_id (FK -> users)   │         │ user_id (FK -> users)   │
  │ amount                  │         │ book_id (FK -> books)   │
  │ paid                    │         │ issue_date              │
  └─────────────────────────┘         │ due_date                │
                                      │ return_date             │
               ┌──────────────────────┤ returned                │
               │                      └─────────────────────────┘
               ▼ 1:N
  ┌─────────────────────────┐
  │      reservations       │
  ├─────────────────────────┤
  │ reservation_id (PK)     │
  │ user_id (FK -> users)   │
  │ book_id (FK -> books)   │
  │ status                  │
  └─────────────────────────┘
```

### Table Specifications:
1. **`users`**: Stores student and administrator accounts, credentials, and access roles (`admin`, `student`).
2. **`books`**: Maintains the institutional catalog, metadata, shelf location, and inventory counts (`total_quantity`, `available_quantity`).
3. **`borrow`**: Tracks circulation transactions, loan issue dates, automated 14-day due dates, return dates, and returned flags.
4. **`reservations`**: Holds student queues for out-of-stock titles with status tracking (`reserved`, `cancelled`).
5. **`fines`**: Logs overdue penalty fees and manual assessments with payment tracking (`amount`, `paid`).

---

## ☁️ Production Deployment

The platform is deployed in a cloud-native architecture on **Render** and **Neon**:

1. **Frontend (Render Static Site)**:
   - Hosted at `https://smart-library-system-3rby.onrender.com`.
   - Single Page Application (SPA) routing is configured via Render Rewrite Rules (`/* -> /index.html`) to allow direct URL access and page refreshes.
   - Built using Vite with optimized asset bundling and gzip compression.
2. **Backend (Render Web Service)**:
   - Hosted at `https://smart-library-backend-pbl6.onrender.com`.
   - Python FastAPI application running under Uvicorn.
   - Automatic lifespan execution initializes database tables and runs idempotent initial catalog seeding if the catalog is empty.
3. **Database (Neon Serverless PostgreSQL)**:
   - Cloud PostgreSQL instance connected over SSL with automated connection pooling and pre-ping liveness checks.
4. **Cross-Origin Configuration**:
   - Backend CORS explicitly authorizes the Render frontend domain for authenticated `GET`, `POST`, `PUT`, `DELETE`, and `OPTIONS` requests.

---

## 💻 Local Development Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** and **npm**
- **MySQL 8.0+** (or Docker)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/prathampoojari13/Smart-Library-System.git
cd Smart-Library-System
```

---

### Step 2: Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows:
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your local environment configuration:
   ```bash
   cp .env.example .env
   ```
   *(Adjust `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.env` to match your local database).*

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - Backend API: `http://localhost:8000`
   - Interactive Swagger Docs: `http://localhost:8000/docs`

---

### Step 3: Frontend Setup

1. In a new terminal window, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Configure local environment (optional for default `http://localhost:8000`):
   ```bash
   cp .env.example .env
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - Frontend UI: `http://localhost:5173`

---

### Step 4: Docker Orchestration (Alternative)

To build and launch the entire stack (MySQL 8.0 + FastAPI backend + React/Nginx frontend) in a single command:
```bash
docker compose up -d --build
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

---

## 🧪 Testing & Verification

The project includes an automated test verification suite that tests all system capabilities end-to-end:

```bash
cd backend
python test_system.py
```

### Verification Suite Coverage:
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

Frontend production bundle verification:
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
│   │   ├── models/            # SQLAlchemy ORM models (user, book, borrow, reservation, fine)
│   │   ├── routes/            # FastAPI route handlers (users, book, borrow, reservation, fine, admin, dashboard)
│   │   ├── schemas/           # Pydantic validation & response serialization schemas
│   │   ├── utils/             # Security (bcrypt, JWT), auth guards, seed utilities
│   │   ├── config.py          # Centralized settings & connection string normalizers
│   │   ├── database.py        # SQLAlchemy engine, session factory, connection health checks
│   │   └── main.py            # FastAPI entry point, CORS middleware, lifespan events
│   ├── .env.example           # Backend environment variable template
│   ├── Dockerfile             # Python backend Docker container image
│   ├── requirements.txt       # Backend dependencies (FastAPI, SQLAlchemy, psycopg2, PyMySQL, bcrypt, jose)
│   ├── reset_admin_user.py    # Admin verification and password reset script
│   └── test_system.py         # End-to-end integration & security verification suite
├── frontend/
│   ├── public/                # Static public assets (favicon.svg, favicon.ico, icons.svg)
│   ├── src/
│   │   ├── api/               # Axios API client with dynamic base URL & auth interceptor
│   │   ├── components/        # Reusable UI components (Navbar, Sidebar, StatCard, Toast, DashboardChart)
│   │   ├── context/           # React context providers (ToastContext, confirmation modals)
│   │   ├── pages/             # Portal views (Dashboard, Books, Borrow, Reservations, Fines, Admin, Login, Register)
│   │   ├── utils/             # Client-side session and auth helpers
│   │   ├── App.jsx            # React Router routing and protected route wrappers
│   │   ├── index.css          # Tailwind CSS global styles & theme tokens
│   │   └── main.jsx           # React DOM root entry point
│   ├── .env.example           # Frontend environment variable template
│   ├── Dockerfile             # Multi-stage Vite build + Nginx Alpine container image
│   ├── nginx.conf             # Production Nginx reverse proxy configuration
│   ├── package.json           # Frontend dependencies and npm scripts
│   └── vite.config.js         # Vite configuration with React & Tailwind plugins
├── database/
│   └── init.sql               # Database schema initialization and seed reference data
├── docker-compose.yml         # Full-stack multi-container Docker orchestration
├── .gitignore                 # Universal Git ignore rules
└── README.md                  # Project documentation
```

---

## 📸 Screenshots

*(Screenshots can be added below for project presentations and portfolio showcases)*

| View | Preview |
| :--- | :--- |
| **Catalog & Book Search** | *[ Screenshot Placeholder: Student Catalog with Live Availability & Filters ]* |
| **Borrowing & Circulation** | *[ Screenshot Placeholder: Active Loans with 14-Day Due Date Tracking ]* |
| **Admin Management Console** | *[ Screenshot Placeholder: Admin Catalog Management & Fine Ledger ]* |
| **Dashboard Analytics** | *[ Screenshot Placeholder: Real-time Telemetry Counters & Visualizations ]* |

---

## 🔮 Future Improvements

The following architectural enhancements are planned as future extensions:
- **Online Payment Gateway**: Integration with Stripe or Razorpay for direct online student fine clearance.
- **Automated Notifications**: Email and SMS reminders (via SendGrid or Twilio) for upcoming loan due dates and overdue fines.
- **Barcode / QR Code Scanner**: Mobile camera barcode scanning for rapid physical book checkout and check-in.
- **AI Book Recommendations**: Collaborative filtering recommendation engine based on borrowing trends.
- **Mobile Application**: Native mobile application built with React Native.
- **Cloud Telemetry & Monitoring**: Integration with Prometheus and Grafana for backend uptime monitoring.

---

## 👨‍💻 Author

**Pratham K**  
*Department of Computer Science and Engineering*  
*BMS Institute of Technology and Management*

---

## 📄 License

This project currently has no explicit open-source license. All rights reserved.
