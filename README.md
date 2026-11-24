# 🏨 GrandStay - Full-Stack Hotel Management System

A professional, full-stack **Hotel Management System** built with **React.js (Vite)**, **Redux Toolkit**, **Node.js (Express)**, **PostgreSQL (Native SQL Queries only)**, and **Leaflet & OpenStreetMap**.

---

## 🌟 Key Features & Requirements Checklist

### 1. Hotel List Page
- **Responsive Layout**: Clean desktop, tablet, and mobile views.
- **Top Navigation Bar**: Brand logo, quick search bar, and "+ Add Hotel" CTA button.
- **Left Sidebar Filter**: Minimum and maximum price filtering with numerical inputs and quick select chips (`<$100`, `$100-$250`, `$250-$500`, `$500+`).
- **Hotel Cards**: High-resolution image, pricing badge (`$/night`), coordinates, description snippet, "View Details", "Edit", and "Delete" actions.
- **Search**: Real-time keyword search by hotel title.
- **Pagination**: Offset and limit-based pagination managed through backend SQL queries.

### 2. Add & Edit Hotel Form (Reusable Component)
- **Reusable `HotelForm`**: The same form component powers both Add and Edit pages.
- **Fields**: Title, Description, Price, Latitude, Longitude, Image upload.
- **Live Image Preview**: Instant file preview with drag-and-drop support, type validation (JPEG/PNG/WEBP), and size limit enforcement (<5MB).
- **Interactive Location Picker**: Click anywhere on the embedded OpenStreetMap to pinpoint coordinates.
- **Browser Geolocation API**: "Use My Current Location" button auto-populates exact GPS coordinates.
- **Field Validation**: Inline errors for title length, description length, price > 0, and valid latitude/longitude ranges.

### 3. Hotel Details Page
- **Hero Display**: Full property imagery with coordinates and price badge.
- **Property Details**: In-depth description and luxury amenities.
- **Interactive Leaflet & OpenStreetMap**: Shows hotel location pin with custom popup, external OpenStreetMap link, and Google Maps directions link.
- **Browser Geolocation Distance Tool**: Computes the real-time distance in kilometers and miles between the user's current GPS location and the hotel property using the Haversine formula.
- **Quick Actions**: Edit and Delete with confirmation modal.

### 4. Backend APIs & Native SQL Database
- **No ORMs Used**: Pure native parameterized SQL queries using `pg` (`Pool`).
- **Parameterized Queries**: Full protection against SQL injection (`$1`, `$2`, etc.).
- **Endpoints**:
  - `POST /api/hotels` - Create hotel with image upload (Multer)
  - `GET /api/hotels` - Retrieve paginated hotels with search (`ILIKE`) and price filters (`>=`, `<=`)
  - `GET /api/hotels/:id` - Retrieve single hotel by primary key
  - `PUT /api/hotels/:id` - Update hotel and optionally replace image file
  - `DELETE /api/hotels/:id` - Delete hotel record and remove file from disk

### 5. File Upload & Safety
- **Multer Middleware**: Saves files in `server/uploads/` with unique sanitized filenames.
- **Automatic File Cleanup**: Deletes previous image files upon update and removes the image file upon hotel deletion (`fs.unlink`).

### 6. State Management & SEO
- **Redux Toolkit**: Clean slice architecture (`hotelSlice.js`) handling list, single hotel, pagination, search/price filters, and asynchronous CRUD operations.
- **React Helmet Async**: Dynamic SEO page titles, meta descriptions, and OpenGraph tags for every route.
- **Image Accessibility**: Descriptive alt tags on every hotel image for accessibility and SEO.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Redux Toolkit, React-Redux, React Router DOM v6, Axios, React Helmet Async, Leaflet, React-Leaflet, Lucide Icons, Custom Responsive CSS3 |
| **Backend** | Node.js, Express.js, Multer, CORS, Dotenv |
| **Database** | PostgreSQL, Native SQL (`pg` connection pool) |
| **Testing** | Node.js native API test suite (`server/test-api.js`) |

---

## 📁 Project Structure

```text
hotel-management-system/
├── package.json               # Root scripts for running client & server
├── README.md                  # Project documentation
│
├── client/                    # Frontend React + Vite Application
│   ├── public/
│   │   └── hotel-logo.svg     # SVG logo
│   ├── src/
│   │   ├── app/
│   │   │   └── store.js       # Redux Toolkit store
│   │   ├── components/
│   │   │   ├── DeleteModal.jsx     # Confirmation dialog
│   │   │   ├── EmptyState.jsx      # Friendly no-results state
│   │   │   ├── HotelCard.jsx       # Card displaying hotel info
│   │   │   ├── HotelForm.jsx       # Reusable Add/Edit form
│   │   │   ├── HotelMap.jsx        # Leaflet interactive map
│   │   │   ├── LocationPicker.jsx  # Map-based coordinate picker
│   │   │   ├── Navbar.jsx          # Top navbar with search
│   │   │   ├── Pagination.jsx      # Page navigation
│   │   │   ├── SidebarFilter.jsx   # Price range filter
│   │   │   └── Toast.jsx           # Notification alerts
│   │   ├── features/
│   │   │   └── hotels/
│   │   │       └── hotelSlice.js   # Redux slice & async thunks
│   │   ├── pages/
│   │   │   ├── AddHotelPage.jsx
│   │   │   ├── EditHotelPage.jsx
│   │   │   ├── HotelDetailsPage.jsx
│   │   │   ├── HotelListPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   └── api.js              # Axios configuration
│   │   ├── styles/
│   │   │   └── index.css           # Modern professional CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                    # Backend Node.js + Express + PostgreSQL API
    ├── uploads/               # Uploaded hotel images
    ├── src/
    │   ├── config/
    │   │   └── db.js          # Native PostgreSQL pool & fallback
    │   ├── controllers/
    │   │   └── hotelController.js # Parameterized SQL query handlers
    │   ├── db/
    │   │   ├── init.sql       # Native DDL schema
    │   │   ├── init.js        # DB and table creation script
    │   │   └── seed.js        # Initial sample luxury hotels seeder
    │   ├── middleware/
    │   │   ├── errorHandler.js# Centralized error handler
    │   │   └── upload.js      # Multer file upload configuration
    │   ├── routes/
    │   │   └── hotelRoutes.js # Express router definitions
    │   └── server.js          # Express app entry point
    ├── .env                   # Environment variables
    ├── .env.example           # Example configuration
    ├── package.json
    └── test-api.js            # Automated CRUD API test runner
```

---

## 🚀 Setup & Running Instructions

### Prerequisites
- **Node.js** (v18+ recommended, v20+ supported)
- **npm** (v9+ recommended)
- **PostgreSQL** (v12+ recommended; an in-memory emulator `pg-mem` automatically activates if PostgreSQL is not running locally, allowing instant testing without setup hurdles).

---

### Step 1: Environment Configuration
Check `server/.env` (pre-configured with defaults):
```ini
PORT=5000
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_management
```

*(Optional)* If using a hosted PostgreSQL instance (e.g. Supabase, Neon, Render, AWS RDS), you can provide `DATABASE_URL`:
```ini
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

---

### Step 2: Database Initialization (PostgreSQL)
Ensure your PostgreSQL service is running, then execute:
```bash
# Initialize database and tables
npm run db:init --prefix server

# Seed initial luxury hotels
npm run db:seed --prefix server
```

---

### Step 3: Run the Application

#### Option A: Run Both Concurrently (Separate Terminals)

**Terminal 1 (Backend Server):**
```bash
cd server
npm start
# Server starts at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Frontend starts at http://localhost:3000
```

#### Option B: From Project Root
```bash
# Start backend
npm run server

# In another terminal, start frontend
npm run client
```

Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Testing the APIs

To run the automated CRUD test suite validating all endpoints:
```bash
node server/test-api.js
```
Expected output:
- `GET /api/health` ➔ 200 OK
- `GET /api/hotels` ➔ 200 OK (Paginated list)
- `GET /api/hotels?search=Azure` ➔ 200 OK (Title search)
- `GET /api/hotels?minPrice=200&maxPrice=350` ➔ 200 OK (Price filter)
- `GET /api/hotels/:id` ➔ 200 OK (Single item)
- `POST /api/hotels` ➔ 201 Created (Image upload + native insert)
- `PUT /api/hotels/:id` ➔ 200 OK (Native update)
- `DELETE /api/hotels/:id` ➔ 200 OK (Delete record + delete file from disk)

---

## 📡 REST API Reference

| Method | Endpoint | Description | Query / Body Params |
|---|---|---|---|
| `GET` | `/api/health` | Service health status | None |
| `GET` | `/api/hotels` | List hotels with filters | `search`, `minPrice`, `maxPrice`, `page`, `limit` |
| `GET` | `/api/hotels/:id` | Get single hotel details | Route param `:id` |
| `POST` | `/api/hotels` | Create new hotel | Multipart: `title`, `description`, `price`, `latitude`, `longitude`, `image` |
| `PUT` | `/api/hotels/:id` | Update hotel | Multipart: `title`, `description`, `price`, `latitude`, `longitude`, optional `image` |
| `DELETE`| `/api/hotels/:id` | Delete hotel & image | Route param `:id` |
