# Carthage - University Management System

Carthage is a comprehensive university management system built with Next.js and FastAPI, designed to streamline administrative workflows for university staff, faculty, and students.

## Overview

Carthage provides a robust platform for managing various university operations, including:
- **User Authentication**: Secure login for students, faculty, and staff with role-based access control
- **Document Management**: Tracking, validation, and management of official documents
- **Event & Activity Management**: Organizing and promoting university events
- **Program Management**: Defining and managing academic programs and specializations
- **Financial Management**: Tuition payment tracking and financial record management
- **Communications**: Internal messaging system for announcements and notifications

## Features

### For Students
- View academic programs and specializations
- Track tuition payment status
- Receive official communications and announcements
- Access educational resources

### For Faculty & Staff
- Manage student records and information
- Validate and process documents
- Organize events and activities
- Track program offerings
- Manage financial records

### For University Administration
- Centralized dashboard for all operations
- Role-based access control
- System-wide notifications and alerts
- Comprehensive reporting and analytics

## Technology Stack

### Frontend
- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Lucide React
- **State Management**: Zustand
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI
- **Language**: Python
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **Background Tasks**: Celery with Redis

## Project Structure

```
carthage/
├── frontend/             # Next.js frontend application
├── backend/              # FastAPI backend application
├── .gitignore            # Git ignore configurations
├── docker-compose.yml    # Docker orchestration for development
└── README.md             # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher)
- Docker (optional, for containerized development)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd carthage
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   # Initialize database
   python -c "from app.core.db_init import create_tables; create_tables()"
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install  # or yarn install
   ```

### Development

Start both backend and frontend services:

```bash
cd backend
python app/main.py

cd ../frontend
npm run dev  # or yarn dev
```

The application will be accessible at `http://localhost:3000`.

### Production

For production deployment, use Docker:

```bash
docker-compose up --build
```

## Database

The system uses PostgreSQL with SQLAlchemy for database operations. The initial schema is automatically created using Alembic migrations.

## API Documentation

The FastAPI backend provides comprehensive API documentation available at `/docs` and `/redoc` when the server is running.

## Environment Configuration

Create a `.env` file in both `backend` and `frontend` directories with the following variables:

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/carthage
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis for Celery
REDIS_URL=redis://localhost:6379/0
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
```

## License

This project is licensed under the MIT License.
