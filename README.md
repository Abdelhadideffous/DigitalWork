# DigitalWork

A modern web-based project management platform designed to streamline team collaboration, task tracking, and requirements management. DigitalWork enables organizations to efficiently organize projects, assign tasks, manage team members, and maintain requirements documentation in a centralized system.

## Key Features

- **User Authentication & Role Management** - Multi-role system (Admin, Manager, Employee) with granular access control
- **Project Management** - Create, organize, and track projects with custom statuses and priorities
- **Task Management** - Hierarchical task structure with subtasks, task dependencies, and progress tracking
- **Requirements Documentation** - Formal requirements specification documents (EDB - Cahier d'Expression de Besoin) for project validation
- **Team Collaboration** - Team management, task assignment, and user permissions
- **Real-Time Notifications** - Event-driven notifications for project and task updates
- **Project Comments** - Inline commenting system for team communication on projects
- **Role-Based Dashboards** - Personalized views for Admins, Managers, and Employees
- **Data Export** - Export project and task data to PDF and Excel formats

## Tech Stack

![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=flat&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Material-UI](https://img.shields.io/badge/MUI-007FFF?style=flat&logo=mui&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=flat&logo=mysql&logoColor=white)

**Backend:** Laravel 11, PHP 8.x
**Frontend:** React 19, TypeScript, Vite
**Styling:** Tailwind CSS 4, Material-UI (MUI)
**Database:** MySQL (configurable to SQLite for development)
**Real-Time:** Event listeners, WebSocket-ready architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Pages: Dashboard, Projects, Tasks, Teams, EDB   │   │
│  │ Components: Notifications, Comments, Forms      │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┘
                   │ API (REST + Events)
┌──────────────────▼──────────────────────────────────────┐
│                 Backend (Laravel)                       │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Controllers: Projects, Tasks, Teams, EDB, Auth  │   │
│  │ Models: Project, Task, User, Team, Notification │   │
│  │ Services: TaskStatusUpdater, NotificationService│   │
│  │ Events: TaskCreated, ProjectUpdated, etc.       │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│                  Database (MySQL)                       │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- **Node.js** 18+ (for frontend)
- **PHP** 8.2+ (for backend)
- **Composer** (PHP dependency manager)
- **npm** (Node package manager)
- **MySQL** 8.0+ or SQLite (for development)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Abdelhadideffous/pfe.git
cd pfe
```

### 2. Backend Setup

#### Install PHP Dependencies
```bash
composer install
```

#### Configure Environment
Copy the example environment file and update it:
```bash
cp .env.example .env
```

Generate application key:
```bash
php artisan key:generate
```

#### Set Up Database
Run migrations to create the database schema:
```bash
php artisan migrate
```

*(Optional) Seed the database with sample data:*
```bash
php artisan db:seed
```

#### Start Backend Server
```bash
php artisan serve
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd front-end
```

Install dependencies:
```bash
npm install
```

#### Development Server
Start the Vite development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or another port if 5173 is in use)

#### Build for Production
```bash
npm run build
```

### 4. Access the Application

1. Open your browser to `http://localhost:5173`
2. Log in with default credentials (created during seeding):
   - **Admin**: Email: `admin@test.com` | Password: `password`
   - **Manager**: Email: `manager@test.com` | Password: `password`
   - **Employee**: Email: `employee@test.com` | Password: `password`

## Environment Variables

Create a `.env` file based on `.env.example` and configure:

### Application
- `APP_NAME` - Application name (default: `Laravel`)
- `APP_ENV` - Environment mode (`local`, `production`)
- `APP_DEBUG` - Debug mode (`true`/`false`)
- `APP_URL` - Base URL of the application

### Database
- `DB_CONNECTION` - Database type (`mysql`, `sqlite`)
- `DB_HOST` - Database host (for MySQL)
- `DB_PORT` - Database port (default: 3306)
- `DB_DATABASE` - Database name
- `DB_USERNAME` - Database username (for MySQL)
- `DB_PASSWORD` - Database password (for MySQL)

### Session & Security
- `SESSION_DRIVER` - Session storage (`database`, `file`)
- `BCRYPT_ROUNDS` - Password hashing rounds (default: 12)

### Email (Optional)
- `MAIL_MAILER` - Mail driver (`log`, `smtp`, `mailgun`)
- `MAIL_FROM_ADDRESS` - Sender email address

For development, `DB_CONNECTION=sqlite` and `MAIL_MAILER=log` are recommended.

## Project Structure

```
pfe/
├── app/
│   ├── Http/
│   │   ├── Controllers/        # API endpoints
│   │   ├── Requests/          # Form validation
│   │   └── Middleware/        # Request middleware
│   ├── Models/                # Database models
│   ├── Events/                # Event classes
│   ├── Listeners/             # Event listeners
│   ├── Services/              # Business logic
│   └── Notifications/         # Notification classes
├── routes/
│   └── api.php                # API routes
├── database/
│   ├── migrations/            # Database schema
│   └── seeders/              # Sample data
├── front-end/
│   ├── src/
│   │   ├── pages/            # Page components (Dashboard, Projects, Tasks, etc.)
│   │   ├── components/       # Reusable components
│   │   ├── routes/           # Frontend routing
│   │   └── utils/            # Utility functions
│   ├── index.html            # HTML entry point
│   └── vite.config.ts        # Vite configuration
├── public/                    # Static assets
├── storage/                   # File uploads, logs
├── LICENSE                    # MIT License
└── README.md                  # This file
```

## Testing the Installation

### Backend
Verify Laravel is running:
```bash
curl http://localhost:8000/
```

### Frontend
Verify Vite is running:
```bash
curl http://localhost:5173/
```

### API Connection
The frontend communicates with the backend via API calls. Check the browser's Network tab in Developer Tools to verify requests are sent to `http://localhost:8000/api/`.

## Screenshots

Planned screenshots to document the application (place in `docs/screenshots/`):

- **Login Page** - User authentication interface
- **Admin Dashboard** - Administrative overview with system statistics
- **Manager Dashboard** - Project and team management view
- **Employee Dashboard** - Assigned tasks and notifications
- **Projects List** - Project overview with filters
- **Project Details** - Project view with team, tasks, and comments
- **Task Management** - Task list with creation and editing
- **Task Details** - Task view with subtasks, dependencies, and comments
- **Team Management** - Team members and role assignment
- **Requirements Document (EDB)** - Specification document creation and validation
- **Notifications** - Real-time notification center
- **User Roles & Permissions** - Role management interface

*To generate screenshots: Log in as each role, navigate to key features, and capture representative views.*

## API Documentation

Key API endpoints:

- `POST /api/login` - User authentication
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Project details
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/edb` - List requirements documents
- `POST /api/edb` - Create requirements document
- `GET /api/notifications` - User notifications

See route files in `routes/api.php` for complete endpoint documentation.

## Development Guidelines

### Frontend
- Use TypeScript for type safety
- Follow React best practices and hooks
- Use Material-UI for consistent styling
- Test components before committing

### Backend
- Use Laravel eloquent for database queries
- Follow RESTful API conventions
- Implement proper validation with Form Requests
- Add events for major actions

### Database
- All migrations must be reversible
- Use meaningful table and column names
- Create indexes for frequently queried fields

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

**Abdelhadi Deffous**  
GitHub: [@Abdelhadideffous](https://github.com/Abdelhadideffous)

---

*Bachelor's final-year project (PFE) in Computer Science at USTHB, 2025*
