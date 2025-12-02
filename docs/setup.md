# Setup Guide

This guide will help you set up the ShopApp development environment.

## Prerequisites

- Node.js v14 or higher
- MongoDB (local instance or MongoDB Atlas)
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/shop-app-erp.git
cd shop-app-erp
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Running the Application

Open two terminal windows:

Terminal 1 - Start the backend:
```bash
cd backend
npm run server
```

Terminal 2 - Start the frontend:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## Testing

Run tests with:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Troubleshooting

Common issues and solutions:

1. **Port already in use**: Change the PORT value in your backend `.env` file
2. **MongoDB connection error**: Verify your `MONGO_URI` in the backend `.env` file
3. **Missing dependencies**: Run `npm install` in both frontend and backend directories