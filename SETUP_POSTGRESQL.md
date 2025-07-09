# PostgreSQL Setup Instructions

## Prerequisites

1. **PostgreSQL installed and running**
2. **Node.js and npm installed**
3. **Database credentials ready**

## Setup Steps

### 1. Create PostgreSQL Database

Connect to PostgreSQL and create the database:

```sql
CREATE DATABASE amom_accounting;
```

### 2. Run Database Schema

Execute the schema file to create all tables:

```bash
cd server
psql -U postgres -d amom_accounting -f database/schema.sql
```

### 3. Configure Environment Variables

Update the `.env` file in the `server` directory with your PostgreSQL credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=amom_accounting
DB_USER=postgres
DB_PASSWORD=your_actual_password_here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 4. Install Backend Dependencies

```bash
cd server
npm install
```

### 5. Start the Backend Server

```bash
# Development mode
npm run dev

# Or production mode
npm start
```

### 6. Start the Frontend

In a new terminal:

```bash
# From the main project directory
npm run dev
```

## Verification

1. **Backend Health Check**: Visit `http://localhost:3001/api/health`
2. **Frontend**: Visit `http://localhost:5173`
3. **Registration**: Create a new account through the frontend
4. **Database**: Check that tables are populated in PostgreSQL

## Database Schema Overview

The schema includes:
- **organizations** - Company data
- **users** - User accounts
- **accounts** - Chart of accounts
- **contacts** - Customers and suppliers
- **invoices** & **bills** - Financial documents
- **journal_entries** - Double-entry bookkeeping
- **items** - Products and services
- **tax_rates** - Tax configuration
- **audit_logs** - Change tracking

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user info
- `GET /api/accounts` - Get accounts
- `GET /api/contacts` - Get contacts
- `GET /api/invoices` - Get invoices
- `GET /api/bills` - Get bills
- And more...

## Features Now Available

- ✅ Real PostgreSQL database connection
- ✅ JWT authentication
- ✅ User registration and login
- ✅ Account management
- ✅ Contact management
- ✅ Invoice creation and management
- ✅ Bill creation and management
- ✅ Financial reporting
- ✅ Audit trails
- ✅ Multi-user support
- ✅ Organization separation

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Organization-based data isolation
- Input validation
- CORS protection
- Helmet security middleware

## Next Steps

1. Update the database credentials in `server/.env`
2. Run the database schema
3. Start both servers
4. Register a new user
5. Start using the application with real data!

The application will now persist all data to PostgreSQL instead of using temporary mock data.