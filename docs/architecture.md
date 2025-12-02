# System Architecture

## Overview

ShopApp follows a typical MERN stack separation architecture with a React frontend and Node.js/Express backend, using MongoDB as the database.

## High-Level Architecture

```
┌─────────────┐    HTTP    ┌──────────────┐    MongoDB    ┌────────────┐
│   React     │ ─────────→ │ Node/Express │ ────────────→ │            │
│  Frontend   │ ←───────── │   Backend    │ ←──────────── │     DB     │
└─────────────┘    JSON    └──────────────┘   Mongoose   └────────────┘
```

## Technology Stack

### Frontend
- React.js (v18+, built with Vite)
- Redux Toolkit (with RTK Query)
- React Bootstrap (UI framework)
- Chart.js (data visualization)
- React-To-Print (printing functionality)
- Vite (build tool)

### Backend
- Node.js (v14+)
- Express.js
- MongoDB (with Mongoose ODM)
- JWT (authentication)
- Multer (file uploads)

## Project Structure

### Backend Directory Structure

```
backend/
├── config/           # Database and other configurations
├── controllers/      # Request handlers
├── middleware/       # Custom middleware functions
├── models/           # Data models (Mongoose schemas)
├── routes/           # API route definitions
├── utils/            # Utility functions
├── scripts/          # Initialization scripts
└── ...
```

### Frontend Directory Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Page-level components
│   ├── slices/          # Redux state slices
│   └── ...
├── ...
```

## Design Patterns

### Backend

1. **Middleware Pattern**: Used for authentication (`authMiddleware`) and error handling (`errorMiddleware`)
2. **Factory Pattern**: `generateToken.js` encapsulates JWT generation logic
3. **Modular Routing**: Each business module has independent route files (e.g., `productRoutes.js`)
4. **Layered Architecture**: Controller → Service/Logic → Model

### Frontend

1. **State Management**: Redux Toolkit with RTK Query for API communication
2. **Component-Based Architecture**: Reusable components and page-specific screens
3. **Single Page Application**: Client-side routing with React Router

## Data Flow

1. User interacts with React frontend → RTK Query calls API
2. Request sent via HTTP to Express server → `authMiddleware` validates JWT
3. Controller calls model for database operations (Mongoose)
4. Database returns results → controller processes and responds with JSON
5. Frontend receives data → updates UI (charts, tables, etc.)

## API Design

- RESTful API design principles
- Consistent response formats
- Proper HTTP status codes
- Error handling with meaningful messages