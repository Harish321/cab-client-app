# Cab Management Server Application

A RESTful API server for managing cab operations including trips, fuel expenses, payments, and salaries.

## 📋 Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [API Usage Examples](#api-usage-examples)
- [Dashboard APIs](#dashboard-apis)

## ✨ Features

- **Unified API Architecture**: Single endpoints for GET and POST operations that route to appropriate controllers
- **Cab Management**: Retrieve cab information including service numbers and driver details
- **Trip Tracking**: Record and manage daily trip counts and distances
- **Expense Management**: Track fuel and other expenses
- **Payment Processing**: Manage payment records
- **Salary Management**: Track salary payments to drivers
- **Dashboard & Reporting**: Monthly summary reports with aggregated metrics and net income calculations
- **Daily Drill-Down**: Date-wise breakdown of trips and expenses for detailed analysis
- **Smart Response System**: Returns existing records or empty templates with all keys
- **Flexible Updates**: Automatically creates new records or updates existing ones based on ID presence

## 🛠 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Database Client**: mysql2 (with connection pooling)
- **Architecture**: MVC (Model-View-Controller)

## 📁 Project Structure

```
cab-server-app/
├── models/
│   ├── cabsModel.js         # Cab data model
│   ├── tripsModel.js        # Trip data model
│   ├── expensesModel.js     # Expense/fuel data model
│   ├── paymentsModel.js     # Payment data model
│   └── salariesModel.js     # Salary data model
├── controllers/
│   ├── cabsController.js    # Cab operations controller
│   ├── tripsController.js   # Trip operations controller
│   ├── expensesController.js # Expense operations controller
│   ├── paymentsController.js # Payment operations controller
│   └── salariesController.js # Salary operations controller
├── routes/
│   └── cabRoutes.js         # API route definitions
├── db.js                    # Database connection pool
├── app.js                   # Main application file
├── server.js                # POC server (ignore)
├── creation-scripts.sql     # Database schema
├── package.json             # Dependencies
└── README.md               # This file
```

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/Harish321/cab-server-app.git
cd cab-server-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure database connection**
Edit `db.js` with your database credentials:
```javascript
const pool = mysql.createPool({
  host: "your-db-host",
  user: "your-db-user",
  password: "your-db-password",
  database: "cabs",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
```

## 🗄️ Database Setup

Run the SQL scripts from `creation-scripts.sql` to create the required tables:

```sql
-- Tables: cabs, trips, expenses, payments, salaries
-- Refer to creation-scripts.sql for complete schema
```

## ▶️ Running the Application

**Start the server:**
```bash
npm start
```

The server will start on port 3000 (or the port specified in PORT environment variable).

```
Server is running on port 3000
API endpoints available at http://localhost:3000/api/cab-data
```

## 🌐 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### 1. Get Cabs
**Endpoint**: `GET /api/cabs`

Retrieve cab information for your UI.

**Query Parameters** (all optional):
- `id` - Get specific cab by ID
- `service_number` - Get specific cab by service number
- No parameters - Get all cabs

**Example Requests:**
```bash
# Get all cabs
curl "http://localhost:3000/api/cabs"

# Get cab by ID
curl "http://localhost:3000/api/cabs?id=1"

# Get cab by service number
curl "http://localhost:3000/api/cabs?service_number=CAB001"
```

**Response:**
```json
[
  {
    "id": 1,
    "service_number": "CAB001",
    "driver_name": "John Doe",
    "created_at": "2025-01-15T10:00:00.000Z",
    "created_by": "admin",
    "updated_at": "2025-01-15T10:00:00.000Z",
    "updated_by": null
  }
]
```

### 2. Unified GET API
**Endpoint**: `GET /api/cab-data`

Retrieve data for trips, fuel, payments, or salaries.

**Query Parameters** (all required):
- `type` - Data type: `trips`, `fuel`, `payments`, `salaries`
- `date` - Date in YYYY-MM-DD format
- `cab_number` - Service number of the cab

**Behavior**:
- Returns existing record if found
- Returns empty template with all keys if not found (values are null or defaults)

**Example Requests:**
```bash
# Get trips
curl "http://localhost:3000/api/cab-data?type=trips&date=2025-01-15&cab_number=CAB001"

# Get fuel expenses
curl "http://localhost:3000/api/cab-data?type=fuel&date=2025-01-15&cab_number=CAB001"

# Get payments
curl "http://localhost:3000/api/cab-data?type=payments&date=2025-01-15&cab_number=CAB001"

# Get salaries
curl "http://localhost:3000/api/cab-data?type=salaries&date=2025-01-15&cab_number=CAB001"
```

**Response (Existing Record)**:
```json
{
  "id": 1,
  "cab_id": 1,
  "total_trips": 25,
  "distance_km": 150.50,
  "date": "2025-01-15",
  "created_at": "2025-01-15T10:00:00.000Z",
  "created_by": "admin",
  "updated_at": "2025-01-15T10:00:00.000Z",
  "updated_by": null
}
```

**Response (No Record - Empty Template)**:
```json
{
  "id": null,
  "cab_id": null,
  "total_trips": 0,
  "distance_km": 0.00,
  "date": null,
  "created_at": null,
  "created_by": null,
  "updated_at": null,
  "updated_by": null
}
```

### 3. Unified POST API
**Endpoint**: `POST /api/cab-data`

Create or update data for trips, fuel, payments, or salaries.

**Behavior**:
- **If `id` is provided**: Updates existing record
- **If `id` is NOT provided**: Creates new record

**Common Body Parameters**:
- `type` (required) - Data type: `trips`, `fuel`, `payments`, `salaries`
- `cab_number` (required) - Service number of the cab
- `date` (required) - Date in YYYY-MM-DD format
- `id` (optional) - Provide for updates, omit for creation
- `created_by` (optional) - Defaults to 'system'
- `updated_by` (optional) - Defaults to 'system'

## 📝 API Usage Examples

### Creating Records

#### Create Trip
```bash
curl -X POST http://localhost:3000/api/cab-data \
  -H "Content-Type: application/json" \
  -d '{
    "type": "trips",
    "cab_number": "CAB001",
    "date": "2025-01-15",
    "total_trips": 25,
    "distance_km": 150.50,
    "created_by": "admin"
  }'
```

#### Create Fuel Expense
```bash
curl -X POST http://localhost:3000/api/cab-data \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fuel",
    "cab_number": "CAB001",
    "date": "2025-01-15",
    "amount": 2500.00,
    "type": "fuel",
    "subtype": "petrol",
    "comments": "Full tank",
    "paid_by": "admin",
    "created_by": "admin"
  }'
```

#### Create Payment
```bash
curl -X POST http://localhost:3000/api/cab-data \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payments",
    "cab_number": "CAB001",
    "date": "2025-01-15",
    "amount": 15000.00,
    "created_by": "admin"
  }'
```

#### Create Salary
```bash
curl -X POST http://localhost:3000/api/cab-data \
  -H "Content-Type: application/json" \
  -d '{
    "type": "salaries",
    "cab_number": "CAB001",
    "date": "2025-01-15",
    "amount": 8000.00,
    "paid_by": "admin",
    "created_by": "admin"
  }'
```

### Updating Records

#### Update Trip
```bash
curl -X POST http://localhost:3000/api/cab-data \
  -H "Content-Type: application/json" \
  -d '{
    "type": "trips",
    "id": 1,
    "cab_number": "CAB001",
    "date": "2025-01-15",
    "total_trips": 30,
    "distance_km": 180.75,
    "updated_by": "admin"
  }'
```

#### Update Fuel Expense
```bash
curl -X POST http://localhost:3000/api/cab-data \
  -H "Content-Type: application/json" \
  -d '{
    "type": "fuel",
    "id": 1,
    "cab_number": "CAB001",
    "date": "2025-01-15",
    "amount": 3000.00,
    "comments": "Updated amount",
    "updated_by": "admin"
  }'
```

## 📈 Dashboard APIs

### Dashboard Summary API
**Endpoint**: `GET /api/dashboard`

Get monthly aggregated summary for the current year with computed net income.

**Query Parameters** (optional):
- `cab_id` - Get summary for specific cab, otherwise returns summary for all cabs

**Example Requests:**
```bash
# Get dashboard for all cabs
curl "http://localhost:3000/api/dashboard"

# Get dashboard for specific cab
curl "http://localhost:3000/api/dashboard?cab_id=1"
```

**Response:**
```json
{
  "year": 2025,
  "cab_id": "all",
  "monthly_summary": [
    {
      "month": "December",
      "month_number": 12,
      "total_trips": 250,
      "total_distance": 1500.50,
      "total_expenses": 25000.00,
      "total_salaries": 8000.00,
      "total_payments": 50000.00,
      "net_income": 17000.00
    },
    {
      "month": "November",
      "month_number": 11,
      "total_trips": 220,
      "total_distance": 1320.00,
      "total_expenses": 22000.00,
      "total_salaries": 8000.00,
      "total_payments": 45000.00,
      "net_income": 15000.00
    }
    // ... other months in descending order
  ],
  "totals": {
    "month": "Total",
    "total_trips": 2800,
    "total_distance": 16800.00,
    "total_expenses": 280000.00,
    "total_salaries": 96000.00,
    "total_payments": 550000.00,
    "net_income": 174000.00
  }
}
```

**Features:**
- ✅ Shows data for current year only
- ✅ Months displayed in descending order (December to January)
- ✅ Computed `net_income` = `payments - (expenses + salaries)`
- ✅ Totals row with sum of all months
- ✅ Filter by specific cab or view all cabs

**Use Case:** Display in a monthly summary table showing financial overview

---

### Daily Drill-Down API
**Endpoint**: `GET /api/dashboard/daily`

Get date-wise breakdown for a specific month. Shows only trips and expenses (salaries and payments excluded as they're not daily activities).

**Query Parameters**:
- `year` (required) - Year (e.g., 2025)
- `month` (required) - Month number (1-12)
- `cab_id` (optional) - Get details for specific cab, otherwise returns for all cabs

**Example Requests:**
```bash
# Get daily details for January 2025 (all cabs)
curl "http://localhost:3000/api/dashboard/daily?year=2025&month=1"

# Get daily details for January 2025 (specific cab)
curl "http://localhost:3000/api/dashboard/daily?year=2025&month=1&cab_id=1"
```

**Response:**
```json
{
  "year": 2025,
  "month": 1,
  "month_name": "January",
  "cab_id": "all",
  "daily_summary": [
    {
      "date": "2025-01-31",
      "day": 31,
      "total_trips": 28,
      "total_distance": 168.50,
      "total_expenses": 2800.00
    },
    {
      "date": "2025-01-30",
      "day": 30,
      "total_trips": 25,
      "total_distance": 150.00,
      "total_expenses": 2500.00
    }
    // ... more dates in descending order
  ],
  "totals": {
    "date": "Total",
    "total_trips": 750,
    "total_distance": 4500.00,
    "total_expenses": 75000.00
  }
}
```

**Features:**
- ✅ Date-wise breakdown for specific month
- ✅ Dates displayed in descending order (most recent first)
- ✅ Shows only operational metrics: trips, distance, expenses
- ✅ Excludes salaries and payments (not daily activities)
- ✅ Totals row with sum for the month
- ✅ Filter by specific cab or view all cabs

**Use Case:** Drill-down from monthly view when user clicks/expands a month to see daily details

---

### Dashboard Integration Example

**Step 1: Show Monthly Dashboard**
```javascript
// Fetch monthly summary
fetch('http://localhost:3000/api/dashboard')
  .then(res => res.json())
  .then(data => {
    // Display monthly_summary in table
    // Show totals row at bottom
  });
```

**Step 2: User Clicks on a Month (e.g., December = month 12)**
```javascript
// Fetch daily details for that month
fetch('http://localhost:3000/api/dashboard/daily?year=2025&month=12')
  .then(res => res.json())
  .then(data => {
    // Display daily_summary in expanded/modal view
    // Show totals row at bottom
  });
```

**UI Flow:**
```
Monthly Dashboard Table:
┌──────────┬───────┬──────────┬─────────┬─────────┬────────────┐
│ Month ▼  │ Trips │ Expenses │ Salary  │ Payment │ Net Income │
├──────────┼───────┼──────────┼─────────┼─────────┼────────────┤
│ Dec [+]  │  750  │ 75,000   │ 24,000  │ 150,000 │  51,000    │
│ Nov      │  700  │ 70,000   │ 24,000  │ 140,000 │  46,000    │
│ Total    │ 2,800 │ 280,000  │ 96,000  │ 550,000 │ 174,000    │
└──────────┴───────┴──────────┴─────────┴─────────┴────────────┘

Daily Drill-Down (when Dec is expanded):
┌──────────────┬───────┬──────────┬──────────┐
│ Date         │ Trips │ Distance │ Expenses │
├──────────────┼───────┼──────────┼──────────┤
│ 2025-12-31   │   28  │  168.50  │  2,800   │
│ 2025-12-30   │   25  │  150.00  │  2,500   │
│ 2025-12-29   │   22  │  132.00  │  2,200   │
│ ...          │  ...  │   ...    │   ...    │
│ Total        │  750  │ 4,500.00 │ 75,000   │
└──────────────┴───────┴──────────┴──────────┘
```

---

## 📊 Response Formats

### Success Responses

**Create Success:**
```json
{
  "message": "Trip created successfully",
  "data": {
    "id": 1,
    "cab_id": 1,
    "total_trips": 25,
    "distance_km": 150.50,
    "date": "2025-01-15",
    "created_by": "admin"
  }
}
```

**Update Success:**
```json
{
  "message": "Trip updated successfully",
  "data": {
    "id": 1,
    "total_trips": 30,
    "distance_km": 180.75,
    "updated_by": "admin"
  }
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "error": "type parameter is required. Valid values: trips, fuel, payments, salaries"
}
```

**404 Not Found:**
```json
{
  "error": "Cab not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## 🔑 Field Descriptions

### Trips Fields
- `total_trips` - Number of trips completed
- `distance_km` - Total distance in kilometers

### Fuel/Expenses Fields
- `amount` - Expense amount
- `type` - Expense type: 'fuel', 'service', 'others'
- `subtype` - Optional subcategory
- `comments` - Optional notes
- `paid_by` - Person who paid

### Payments Fields
- `amount` - Payment amount received

### Salaries Fields
- `amount` - Salary amount paid
- `paid_by` - Person who paid the salary

## 🎯 Integration Tips

1. **Load cabs on page load**: Use `GET /api/cabs` to populate dropdowns
2. **Get cab_id from selection**: Extract `id` field from selected cab
3. **Check existing records**: Use `GET /api/cab-data` to see if data exists for a date
4. **Create or update**: Use `POST /api/cab-data` with or without `id`
5. **Handle empty templates**: If GET returns null values, show empty form

## 📄 License

ISC

## 👤 Author

Harish321

## 🔗 Repository

https://github.com/Harish321/cab-server-app