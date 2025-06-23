# Fintrack - Personal Finance Management Application

Fintrack is a comprehensive personal finance management application that helps users track their income and expenses, categorize transactions, and gain insights into their spending habits.

## Tech Stack

### Frontend
- **Framework**: Next.js 15.3.3 with React 18.3.1
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Hooks (useState, useEffect)
- **Form Handling**: react-hook-form with zod validation
- **Data Visualization**: Recharts for charts and graphs

### Backend
- **Framework**: Next.js (App Router) with Server Components and API Routes
- **API**: RESTful API endpoints for data manipulation
- **Authentication**: JWT-based authentication
- **API Documentation**: OpenAPI 3.0 schema

### Database
- **Database**: SQLite (via Prisma)
- **ORM**: Prisma ORM

### AI Integration
- **AI Framework**: Genkit for AI-powered financial insights
- **Model**: Google AI (based on dependencies)

## Features

### Core Features
1. **Dashboard**
   - Summary cards showing total income, expenses, and balance
   - Income vs. Expense chart for trend analysis
   - Expense by category breakdown chart

2. **Transaction Management**
   - Add, edit, and delete transactions
   - Filter transactions by type (income/expense)
   - Search transactions by description, category, or tags
   - Categorize transactions
   - Pagination for transaction lists

3. **Category Management**
   - Predefined and custom categories
   - Categories for income, expense, or both (general)
   - Add, edit, and delete custom categories
   - Filter categories by type and status

4. **Reports & Insights**
   - AI-powered financial insights based on spending patterns
   - Data export functionality (PDF and Excel - currently mocked)

5. **UI/UX**
   - Responsive design for mobile and desktop
   - Dark/Light theme toggle
   - Language selection (placeholder for internationalization)
   - Toast notifications for user feedback

## Application Flow

### User Journey
1. **Initial Access**
   - User lands on the application and is redirected to the dashboard
   - Dashboard displays financial summary and visualizations
   - If no transactions exist, a welcome message prompts the user to add their first transaction

2. **Managing Transactions**
   - User navigates to the Transactions page
   - User can add new transactions with details like amount, description, date, category, and optional tags
   - Transactions can be filtered, searched, and paginated
   - Each transaction can be viewed in detail, edited, or deleted

3. **Managing Categories**
   - User navigates to the Categories page
   - Predefined categories are available by default
   - User can add custom categories for specific needs
   - Custom categories can be edited or deleted
   - Categories are used to categorize transactions

4. **Generating Insights**
   - User navigates to the Reports & Insights page
   - User can generate AI-powered financial insights based on their transaction data
   - Insights provide analysis of spending habits and suggestions for better financial management
   - User can export their financial data (mock functionality)

### Data Flow
1. **Transaction Creation**
   - User inputs transaction details
   - Data is validated using zod schema
   - Server action processes the data and adds it to the database
   - UI is updated to reflect the new transaction
   - Dashboard charts and summary cards are revalidated

2. **Category Management**
   - User creates or modifies categories
   - Changes are processed through server actions
   - Transaction forms are updated to reflect available categories

3. **AI Insights Generation**
   - User requests financial insights
   - Transaction data is processed and sent to the AI model
   - AI generates personalized financial insights
   - Insights are displayed to the user

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   npm run prisma:seed
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The server will start on port 9002 by default (as configured in package.json).

## API Documentation

The application provides a RESTful API for managing financial data. All API endpoints are protected with JWT authentication except for the registration and login endpoints.

### Authentication Endpoints

- **POST /api/auth/register**
  - Register a new user
  - Body: `{ email, name, password }`
  - Response: `{ success, data: { user, token } }`

- **POST /api/auth/login**
  - Login with email and password
  - Body: `{ email, password }`
  - Response: `{ success, data: { user, token } }`

### Transaction Endpoints

- **GET /api/transactions**
  - Get all transactions with pagination and filtering
  - Query parameters: `type`, `category`, `search`, `page`, `limit`
  - Response: `{ data: Transaction[], pagination: { total, pages, currentPage, limit } }`

- **POST /api/transactions**
  - Create a new transaction
  - Body: `{ date, description, amount, category, type, attachmentUrl?, tags? }`
  - Response: `{ success, data: Transaction }`

- **GET /api/transactions/:id**
  - Get a transaction by ID
  - Response: `{ success, data: Transaction }`

- **PUT /api/transactions/:id**
  - Update a transaction
  - Body: `{ date, description, amount, category, type, attachmentUrl?, tags? }`
  - Response: `{ success, data: Transaction }`

- **DELETE /api/transactions/:id**
  - Delete a transaction
  - Response: `{ success, data: { id } }`

### Category Endpoints

- **GET /api/categories**
  - Get all categories with filtering
  - Query parameters: `type`, `isCustom`, `search`
  - Response: `{ success, data: Category[] }`

- **POST /api/categories**
  - Create a new custom category
  - Body: `{ name, type, icon? }`
  - Response: `{ success, data: Category }`

- **GET /api/categories/:id**
  - Get a category by ID
  - Response: `{ success, data: Category }`

- **PUT /api/categories/:id**
  - Update a custom category
  - Body: `{ name, type, icon? }`
  - Response: `{ success, data: Category }`

- **DELETE /api/categories/:id**
  - Delete a custom category
  - Response: `{ success, data: { id } }`

### User Settings Endpoints

- **GET /api/user/settings**
  - Get user settings
  - Response: `{ success, data: UserSettings }`

- **PUT /api/user/settings**
  - Update user settings
  - Body: `{ theme?, language? }`
  - Response: `{ success, data: UserSettings }`

### Financial Insights Endpoints

- **POST /api/insights/financial**
  - Generate financial insights based on transaction data
  - Response: `{ success, data: { insights, id } }`

### Export Endpoints

- **GET /api/export/transactions**
  - Export transactions in the specified format
  - Query parameters: `format`, `startDate?`, `endDate?`, `type?`
  - Response: File download (currently returns JSON with a note)

## Future Enhancements
- Cloud database integration
- Budget planning and tracking
- Financial goal setting
- Mobile application
- Advanced reporting and analytics
- Recurring transactions
- Bank account integration
