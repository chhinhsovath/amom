# MoneyApp - Financial Management Application

A comprehensive financial management web application built with React.js, Node.js, and PostgreSQL.

## Tech Stack

- **Frontend**: React 18.2.0, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, PostgreSQL
- **Authentication**: JWT-based authentication with cookies
- **Database**: PostgreSQL

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/chhinhsovath/amom.git
cd moneyapp
```

### 2. Install dependencies

#### Frontend dependencies
```bash
npm install
```

#### Backend dependencies
```bash
cd backend
npm install
cd ..
```

### 3. Database Setup

Make sure PostgreSQL is running and create the database:

```bash
createdb moneyapp
```

Apply the database schema:
```bash
PGPASSWORD=12345 psql -h localhost -U postgres -d moneyapp -f database/schema.sql
```

Load sample data (optional):
```bash
PGPASSWORD=12345 psql -h localhost -U postgres -d moneyapp -f database/seed.sql
```

### 4. Environment Configuration

The frontend uses `.env` file for API URL configuration:
```
VITE_API_URL=http://localhost:5000/api
```

The backend uses `backend/.env` file for configuration:
```
PORT=5000
NODE_ENV=development
PGHOST=localhost
PGPORT=5432
PGDATABASE=moneyapp
PGUSER=postgres
PGPASSWORD=12345
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

## Running the Application

### Development Mode

To run both frontend and backend in development mode:

```bash
npm run dev:all
```

Or run them separately:

#### Frontend only:
```bash
npm run dev
```

#### Backend only:
```bash
npm run dev:backend
```

### Production Mode

Build the frontend:
```bash
npm run build
```

Start both frontend and backend:
```bash
npm start
```

## Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- API Health Check: http://localhost:5000/api/health

## Demo Credentials

- **Email**: admin@demo.com
- **Password**: demo123

## Available Scripts

- `npm run dev` - Start frontend development server
- `npm run dev:backend` - Start backend development server
- `npm run dev:all` - Start both frontend and backend
- `npm run build` - Build frontend for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm start` - Start both frontend and backend in production mode

## Features

- **Accounting**: Chart of accounts, journal entries, double-entry bookkeeping
- **Invoicing**: Create, manage, and track invoices
- **Bills**: Manage supplier bills and expenses
- **Contacts**: Customer and supplier management
- **Reporting**: Financial reports including P&L and Balance Sheet
- **Banking**: Bank reconciliation and transaction management
- **Inventory**: Product and service catalog
- **Multi-tenancy**: Organization-based data isolation

## API Endpoints

The backend provides RESTful API endpoints:

- `/api/auth/*` - Authentication endpoints
- `/api/accounts/*` - Chart of accounts management
- `/api/contacts/*` - Contact management
- `/api/invoices/*` - Invoice management
- `/api/bills/*` - Bill management
- `/api/items/*` - Product/service management
- `/api/taxes/*` - Tax rate management
- `/api/transactions/*` - Transaction and journal entries
- `/api/reports/*` - Financial reporting

## Database Schema

The application uses a comprehensive PostgreSQL schema with tables for:
- Organizations and users
- Chart of accounts
- Contacts (customers/suppliers)
- Invoices and bills
- Payments and allocations
- Journal entries
- Bank transactions
- Audit logs

## Development Notes

- The frontend uses Vite for fast development and hot module replacement
- Backend uses nodemon for automatic reloading during development
- All API requests include authentication via JWT tokens in cookies
- CORS is configured to allow frontend-backend communication
- Database queries use parameterized statements to prevent SQL injection