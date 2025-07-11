# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive financial management web application built with React, Vite, and the Base44 SDK. It provides accounting and business management features including invoicing, expense tracking, banking, payroll, inventory management, and financial reporting.

## Development Commands

### Basic Commands
- `npm install` - Install dependencies
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code quality checks

### Development Server
The dev server runs on Vite with hot module replacement enabled. Use `npm run dev` to start development.

## Architecture Overview

### Technology Stack
- **Frontend**: React 18.2.0 with JSX
- **Build Tool**: Vite 6.1.0 with React plugin
- **Styling**: Tailwind CSS 3.4.17 with custom theme
- **Component Library**: shadcn/ui built on Radix UI primitives
- **Routing**: React Router DOM 7.2.0
- **Forms**: React Hook Form 7.54.2 with Zod validation
- **API**: Base44 SDK (@base44/sdk) for backend communication
- **Icons**: Lucide React
- **Charts**: Recharts for data visualization

### Project Structure

#### Core Directories
- `/src/components/` - Feature-organized React components
- `/src/pages/` - Page-level components for routing
- `/src/api/` - API client configuration and entity definitions
- `/src/hooks/` - Custom React hooks
- `/src/lib/` - Core utility functions
- `/src/utils/` - Additional utility functions

#### Component Organization
Components are organized by business domain:
- `accounts/` - Account management and chart of accounts
- `banking/` - Bank accounts, transactions, reconciliation
- `bills/` - Bill management and approval workflows
- `expenses/` - Expense tracking and approval
- `invoices/` - Invoice creation, management, and preview
- `reports/` - Financial reporting components
- `inventory/` - Product and service management
- `ui/` - Reusable UI components from shadcn/ui
- `common/` - Shared utility components

### Routing System
- Uses React Router DOM with centralized route definitions in `/src/pages/index.jsx`
- Page routing follows the pattern: `/{PageName}` (e.g., `/Invoices`, `/Dashboard`)
- URL generation handled by `createPageUrl()` utility in `/src/utils/index.ts`
- Layout component (`/src/pages/Layout.jsx`) provides navigation and consistent page structure

### API Integration
- Base44 SDK client configured in `/src/api/base44Client.js`
- Authentication required for all API operations
- Entity definitions in `/src/api/entities.js`
- Integration configurations in `/src/api/integrations.js`

### Styling Approach
- Tailwind CSS with custom theme configuration
- Dark mode support via next-themes
- shadcn/ui components for consistent design system
- CSS-in-JS for dynamic styling using class-variance-authority
- Responsive design with mobile-first approach

### State Management
- React Hook Form for form state management
- Component-level state with React hooks
- No global state management library (Redux, Zustand, etc.)

### Key Configuration Files
- `vite.config.js` - Vite configuration with path aliases (`@/` -> `./src/`)
- `jsconfig.json` - JavaScript project configuration with path mappings
- `tailwind.config.js` - Tailwind CSS configuration with custom theme
- `components.json` - shadcn/ui component library configuration
- `eslint.config.js` - ESLint configuration with React-specific rules

## Development Patterns

### Path Aliases
- Use `@/` prefix for imports from the src directory
- Example: `import { Button } from "@/components/ui/button"`

### Component Patterns
- Feature-based component organization
- Extensive use of shadcn/ui components for consistency
- Form handling with React Hook Form and Zod validation
- Responsive design with Tailwind CSS classes

### Navigation Structure
The app uses a comprehensive navigation system with:
- Business section: Invoices, Quotes, Bills, Expenses, Payroll, etc.
- Accounting section: Bank accounts, Reports, Chart of accounts, etc.
- Quick create menu for common actions
- Mobile-responsive navigation with collapsible menu

## Testing
No testing framework is currently configured in this project.

## Database Configuration

### PostgreSQL Database
The application uses PostgreSQL as its database system with the following configurations:

#### Production Database
- **Host**: 137.184.109.21
- **Port**: 5432
- **Database**: moneyapp
- **User**: postgres
- **Password**: P@ssw0rd

#### Localhost Database
- **Host**: localhost
- **Port**: 5432
- **Database**: moneyapp
- **User**: postgres
- **Password**: 12345
- **MacBook Password**: 12345

### Database Schema
The database includes comprehensive accounting tables:
- **organizations** - Company/organization data
- **users** - User authentication and profiles
- **accounts** - Chart of accounts with hierarchical structure
- **contacts** - Customers and suppliers
- **tax_rates** - Tax configuration
- **journal_entries** & **journal_entry_lines** - Double-entry bookkeeping
- **invoices** & **invoice_line_items** - Sales invoicing
- **bills** & **bill_line_items** - Purchase bills
- **payments** & **payment_allocations** - Payment processing
- **bank_transactions** - Bank reconciliation
- **items** - Products and services catalog
- **expense_claims** & **expense_claim_lines** - Expense management
- **audit_logs** - Full audit trail

### Database Files
- `database/schema.sql` - Full database schema with indexes and triggers
- `database/seed.sql` - Sample data for development
- `src/lib/database.js` - Database connection and utility functions
- `src/services/AccountingService.js` - Accounting business logic
- `.env.local` - Local environment variables
- `.env.production` - Production environment variables

### Database Setup Commands
```bash
# Apply schema to local database
PGPASSWORD=12345 psql -h localhost -U postgres -d moneyapp -f database/schema.sql

# Load sample data
PGPASSWORD=12345 psql -h localhost -U postgres -d moneyapp -f database/seed.sql
```

## Authentication System
The application uses a local JWT-based authentication system with PostgreSQL:

### Key Components
- `src/services/AuthService.js` - Handles registration, login, logout, and profile management
- `src/contexts/AuthContext.jsx` - React context for authentication state
- `src/components/auth/ProtectedRoute.jsx` - Route protection wrapper
- `src/components/auth/LoginForm.jsx` - Login interface
- `src/components/auth/RegisterForm.jsx` - Registration interface
- `src/pages/AuthPage.jsx` - Authentication page container

### Demo Credentials
- **Email**: admin@demo.com
- **Password**: demo123

### Features
- JWT token-based authentication (stored in cookies)
- Password hashing with bcryptjs
- User profile management
- Organization-based multi-tenancy
- Protected routes and authentication context

## Local Data Layer
The application now uses PostgreSQL exclusively instead of external APIs:

### Data Service
- `src/services/LocalDataService.js` - Replaces Base44 SDK entities
- `src/services/AccountingService.js` - Business logic for accounting operations
- All data operations use the PostgreSQL database
- Organization-scoped data access based on authenticated user

### Essential Commands - Development, build, and quality checks
- `npm install` - Install dependencies
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code quality checks

### Architecture Overview - Technology stack and project structure
- React 18.2.0 with JSX
- Vite 6.1.0 with React plugin
- Tailwind CSS 3.4.17 with custom theme
- shadcn/ui built on Radix UI primitives
- React Router DOM 7.2.0
- React Hook Form 7.54.2 with Zod validation
- Base44 SDK (@base44/sdk) for backend communication
- Lucide React for icons
- Recharts for data visualization


### Component Organization - Domain-based feature organization
  Essential Commands - Development, build, and quality checks
  Architecture Overview - Technology stack and project structureComponent Organization - Domain-based feature organization
  Routing System - React Router setup and URL patterns
  API Integration - Base44 SDK configuration
  Styling Approach - Tailwind CSS and shadcn/ui usage
  Development Patterns - Path aliases and component patterns
  Navigation Structure - Business and accounting sections