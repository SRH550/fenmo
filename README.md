# Expense Tracker - Production Quality Application

A full-stack expense tracking application built with Node.js + Express backend, React frontend with TypeScript, and SQLite database using Prisma ORM.

## 🎯 Features

### Backend
- ✅ RESTful API with Express.js
- ✅ SQLite database with Prisma ORM
- ✅ **Idempotency support** for safe duplicate request handling
- ✅ Input validation and error handling
- ✅ Clean architecture (routes → controllers → services → repository)
- ✅ Money handling using paise (integers) to avoid floating-point errors
- ✅ CORS support for development

### Frontend
- ✅ React 18 with TypeScript
- ✅ Vite bundler for fast development
- ✅ Add expenses with category, amount, description, date
- ✅ Filter expenses by category
- ✅ Sort by date (newest/oldest first)
- ✅ Real-time total calculation
- ✅ Loading and error states
- ✅ Responsive design
- ✅ Idempotency-key header support

## 📋 Architecture

### Backend Structure

```
backend/
├── src/
│   ├── index.ts              # Express app setup, Prisma client
│   ├── middleware/
│   │   ├── errorHandler.ts   # Error handling & logging
│   │   └── idempotency.ts    # Idempotency middleware
│   ├── routes/
│   │   └── expenses.ts       # Route definitions
│   ├── controllers/
│   │   └── expenseController.ts  # Request handlers
│   ├── services/
│   │   └── expenseService.ts     # Business logic
│   ├── repository/
│   │   └── expenseRepository.ts  # Database access
│   └── utils/
│       └── validation.ts     # Input validation & money conversion
├── prisma/
│   └── schema.prisma         # Database schema
├── package.json
└── tsconfig.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ExpenseForm.tsx       # Add expense form
│   │   ├── ExpenseList.tsx       # Display expenses table
│   │   └── ExpenseControls.tsx   # Filter & sort controls
│   ├── hooks/
│   │   └── useExpenses.ts        # API calls & state management
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── styles/
│   │   ├── App.css
│   │   ├── ExpenseForm.css
│   │   ├── ExpenseList.css
│   │   ├── ExpenseControls.css
│   │   └── index.css
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # Entry point
│   └── App.css
├── vite.config.ts
├── index.html
├── package.json
└── tsconfig.json
```

## 🏗️ Design Decisions

### 1. **Money Handling (Paise-based Integers)**
- **Decision**: Store amounts as integers in paise (₹1 = 100 paise)
- **Why**: Avoids floating-point precision errors common in financial applications
- **Trade-off**: API and frontend work with both paise (storage) and rupees (display)
- **Implementation**: Conversion utilities in `validation.ts`

### 2. **Idempotency for Duplicate Requests**
- **Decision**: Implemented idempotency using `Idempotency-Key` header
- **How**: 
  - Store request hash and response in `IdempotencyKey` table
  - On retry with same key, return cached response
  - 24-hour expiration for cleanup
- **Trade-off**: Adds database overhead but ensures data integrity
- **Use Case**: Handles network retries, duplicate form submissions

### 3. **Clean Layered Architecture**
- **Decision**: Separate concerns into routes → controllers → services → repository
- **Why**: 
  - Testability: Each layer can be tested independently
  - Maintainability: Easy to modify business logic without touching routes
  - Reusability: Services can be used across multiple routes
- **Trade-off**: More files for small CRUD operations, but scales well

### 4. **Custom Hooks for API Calls**
- **Decision**: `useExpenses`, `useCreateExpense`, `useExpenseSummary` hooks
- **Why**: 
  - Reusable API logic
  - Centralized error handling
  - Consistent loading states
- **Trade-off**: Could use React Query, but custom hooks are lightweight and sufficient

### 5. **SQLite with Prisma**
- **Decision**: SQLite for local development, Prisma as ORM
- **Why**: 
  - SQLite: No setup required, file-based, perfect for prototyping
  - Prisma: Type-safe, migrations built-in, excellent DX
- **Trade-off**: SQLite not suitable for multi-server deployment (use PostgreSQL in production)

### 6. **CORS Configuration**
- **Decision**: Allow `http://localhost:5173` (Vite dev server)
- **Why**: Needed for local development
- **Trade-off**: Must be changed for production (use environment-based configuration)

## 🔄 API Endpoints

### POST /expenses
Create a new expense (idempotent)

**Headers:**
```
Content-Type: application/json
Idempotency-Key: <uuid>  # Required for idempotency
```

**Request Body:**
```json
{
  "amount": 50000,          // in paise (₹500)
  "category": "Food",
  "description": "Lunch",
  "date": "2024-04-28T12:00:00Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 500,            // in rupees
    "amountPaise": 50000,     // in paise
    "category": "Food",
    "description": "Lunch",
    "date": "2024-04-28T12:00:00Z",
    "createdAt": "2024-04-28T12:00:00Z"
  }
}
```

### GET /expenses
Get expenses with filtering and sorting

**Query Parameters:**
```
GET /expenses?category=Food&sort=date_desc
```

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "summary": {
    "count": 5,
    "total": 2500
  }
}
```

### GET /expenses/summary
Get expense summary by category

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "category": "Food",
      "total": 1500,
      "totalPaise": 150000,
      "count": 3
    }
  ]
}
```

## ⚠️ Validation & Error Handling

### Backend Validation
- ✅ Amount must be > 0
- ✅ Category is required (non-empty string)
- ✅ Date must be valid ISO string
- ✅ Description optional but must be string if provided

### Response Format
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "amount", "message": "Amount must be greater than 0" }
  ]
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ (LTS recommended)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```


3. **Setup Prisma database:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on `https://fenmo-blue.vercel.app`

### Using the Application

1. Open `https://fenmo-blue.vercel.app` in browser
2. Fill the expense form:
   - Amount (in rupees)
   - Category (Food, Transport, etc.)
   - Description (optional)
   - Date
3. Click "Add Expense"
4. View expenses in table
5. Filter by category or sort by date

## 📊 Database Schema

```prisma
model Expense {
  id          String   @id @default(uuid())
  amount      Int      // in paise
  category    String   @db.Text
  description String   @db.Text
  date        DateTime
  createdAt   DateTime @default(now())
}

model IdempotencyKey {
  id          String   @id @default(uuid())
  key         String   @unique
  requestHash String   @db.Text
  response    String   @db.Text
  createdAt   DateTime @default(now())
  expiresAt   DateTime
}
```

## 🔐 Trade-offs & Considerations

### 1. Idempotency Cache Expiry
- **Current**: 24 hours
- **Trade-off**: Could be shorter for high-traffic apps, but 24h safe for most use cases
- **Future**: Implement background job for cleanup

### 2. Error Handling
- **Current**: Generic error messages for security
- **Trade-off**: Less helpful for debugging in production
- **Solution**: Enable detailed logging only in development

### 3. Frontend State Management
- **Current**: React hooks + custom API hooks
- **Trade-off**: Simpler than Redux/Zustand, but less structured for large apps
- **Future**: Consider Redux if app scales significantly

### 4. Category List
- **Current**: Fetched dynamically from expenses
- **Trade-off**: No separate category table
- **Future**: Add predefined categories in database for consistency


### Money Handling Philosophy
This app treats money as integers (paise) to avoid floating-point arithmetic issues:
- ₹500 = 50,000 paise
- ₹1.50 = 150 paise

This is a best practice in financial systems and eliminates rounding errors.

### Idempotency Implementation
The `Idempotency-Key` header allows clients to safely retry requests:
- Same key + same request = cached response (no duplicate expense)
- Different key = new expense created
- Expires after 24 hours for database cleanup

### Clean Architecture Benefits
- **Routes**: Define endpoints and HTTP methods
- **Controllers**: Handle request/response, call services
- **Services**: Contain business logic, format responses
- **Repository**: Database operations, single source of truth

This structure makes the app:
- Easy to test (mock each layer independently)
- Easy to extend (add new features without touching existing code)
- Easy to understand (clear separation of concerns)



---