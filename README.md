# 📚 Smart Library Management System

A production-ready, full-stack library management system featuring automated circulation, role-based access control (RBAC), multi-criteria book search and filtering, automated loan due dates, overdue fine calculations, holds queue management, and real-time dashboard analytics.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | **FastAPI** (Python 3.11+) | Asynchronous RESTful API framework with automatic OpenAPI docs |
| **ORM & Database Driver** | **SQLAlchemy 2.0** + **PyMySQL** | Object-relational mapping with connection pooling and resilient reconnects |
| **Database** | **MySQL 8.0+** | Relational data store (`utf8mb4_unicode_ci`) |
| **Security & Auth** | **JWT (`python-jose`)** + **Bcrypt (`passlib`)** | Cryptographic token-based session handling with strict role enforcement |
| **Frontend** | **React 19** + **Vite 8** | Modern reactive SPA architecture with hot module replacement |
| **Styling** | **TailwindCSS v4** + **Lucide React** | Responsive design system with micro-interactions and custom toast notifications |
| **Containerization** | **Docker** & **Docker Compose** | Multi-stage Docker builds and multi-container orchestration |

---

## 📂 Project Structure

```
Smart-Library-System/
├── backend/
│   ├── app/
│   │   ├── models/            # SQLAlchemy database models (User, Book, Borrow, Reservation, Fine)
│   │   ├── routes/            # REST API routers (users, book, borrow, reservation, fine, admin, dashboard)
│   │   ├── schemas/           # Pydantic validation & serialization schemas
│   │   ├── utils/             # Security, JWT tokens, RBAC dependencies
│   │   ├── config.py          # Centralized, immutable application settings
│   │   ├── database.py        # SQLAlchemy engine, session maker, connection check
│   │   └── main.py            # FastAPI entry point, CORS, and lifecycle handlers
│   ├── .env.example           # Backend environment template
│   ├── Dockerfile             # Python 3.11 slim container image
│   ├── requirements.txt       # Backend dependencies
│   └── test_system.py         # End-to-end integration & security verification suite
├── frontend/
│   ├── src/
│   │   ├── api/               # Axios instance with auth interceptors and dynamic base URL
│   │   ├── components/        # Layout & UI components (Navbar, Sidebar, Toast, RecentActivity)
│   │   ├── context/           # ToastProvider & confirmation modal context
│   │   ├── pages/             # Student & Admin portal views
│   │   └── utils/             # Authentication & token helpers
│   ├── .env.example           # Frontend environment template
│   ├── Dockerfile             # Multi-stage Vite build + Nginx Alpine server
│   ├── nginx.conf             # Production Nginx reverse proxy configuration
│   └── package.json           # Frontend dependencies and build scripts
├── database/
│   └── init.sql               # Database schema initialization and demo seed data
├── docker-compose.yml         # Full-stack Docker orchestration
├── .gitignore                 # Universal Git ignore rules
└── README.md                  # System documentation
```

---

## ⚙️ Environment Configuration

### 1. Backend (`backend/.env`)
Copy `backend/.env.example` to `backend/.env` and update configuration:
```bash
cp backend/.env.example backend/.env
```

| Variable | Default | Description |
| :--- | :--- | :--- |
| `APP_NAME` | `Smart Library Management System` | Application display name |
| `APP_ENV` | `development` | Environment mode (`development` / `production`) |
| `DEBUG` | `False` | Enable detailed debug logs |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL username |
| `DB_PASSWORD` | `your_mysql_password` | MySQL password |
| `DB_NAME` | `smart_library` | Database name |
| `DATABASE_URL` | *(Optional)* | Complete SQLAlchemy connection string |
| `SECRET_KEY` | *(Set secure secret)* | Secret key for JWT token signing |
| `ALGORITHM` | `HS256` | JWT cryptographic algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token expiration duration |
| `LOAN_PERIOD_DAYS` | `14` | Default checkout loan period |
| `DAILY_OVERDUE_FINE` | `5.0` | Daily overdue fine in currency units |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed CORS origins |

### 2. Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```

| Variable | Default | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000` | Backend API gateway URL |

---

## 🗄️ Database Setup

Import the schema and initial seed data into MySQL:
```bash
mysql -u root -p < database/init.sql
```

### Default Demo Credentials:
- **Admin Account**: `admin@library.com` / `admin123`
- **Student Account**: `student@library.com` / `student123`

---

## 🚀 Running Locally

### Step 1: Start Backend
```bash
cd backend
# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server with live reload
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive API Docs (Swagger): `http://127.0.0.1:8000/docs`
- Redoc API Docs: `http://127.0.0.1:8000/redoc`

### Step 2: Start Frontend
```bash
cd frontend
# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
- Frontend UI: `http://localhost:5173`

---

## 🐳 Docker Deployment

To build and run the entire stack (MySQL 8.0 + FastAPI backend + React/Nginx frontend) with a single command:

```bash
docker compose up -d --build
```

- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

To stop and remove containers:
```bash
docker compose down
```

---

## 🧪 Testing & Verification

Run the automated backend test suite:
```bash
cd backend
python test_system.py
```

The test suite validates:
1. Configuration & JWT encode/decode
2. Student registration & strict role enforcement
3. User login & `/users/me` profile lookup
4. Book inventory CRUD & RBAC permission checks
5. Book search (title/author) & multi-filters (category/rack/availability)
6. Borrowing flow & 14-day automatic due-date calculation
7. Overdue loan fine calculation upon return
8. Fine payment flow & response models
9. Admin joined metadata listings (`/fines/`, `/borrow/`, `/reservations/`)
10. Reservation holds queue & cancellation
11. Real-time dashboard analytics counters

Validate the frontend production bundle:
```bash
cd frontend
npm run build
```

---

## 🔒 Security Summary
- **Strict Role-Based Access Control (RBAC)**: All administrative endpoints (`/admin-books`, `/borrow/`, `/fines/`, etc.) strictly check user role `admin`. Public registration is permanently constrained to role `student`.
- **Password Protection**: Passwords are cryptographically hashed using **Bcrypt** with dynamic work factors.
- **JWT Integrity**: Tokens are signed using `HS256` with expiration timestamps and verified on every protected request.
- **Zero Plaintext Secrets**: Sensitive secrets and database credentials are fully externalized to `.env` files.
