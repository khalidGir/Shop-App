# ShopApp - Enterprise Resource Planning System

ShopApp is a full-featured ERP system designed for small to medium-sized retail businesses and wholesalers. It provides a unified platform to solve data silo problems across multiple departments and improve operational efficiency.

## Features

- Real-time inventory monitoring with smart alerts
- Customer credit limit management with automatic transaction blocking
- Automatic financial report generation (P&L, cash flow, aging reports)
- POS interface for quick order creation
- PDF invoice generation and printing
- Multi-role access control and user management
- Expense tracking and supplier management
- Dashboard analytics and reporting

## Technology Stack

### Frontend
- React.js (v18+) with Vite
- Redux Toolkit with RTK Query for state management
- React Bootstrap for UI components
- React Router for navigation
- Chart.js for data visualization

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Helmet.js for security
- Winston/Morgan for logging

## Prerequisites

- Node.js v14 or higher
- MongoDB instance (local or cloud)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd shop-app-erp
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

4. Configure environment variables:
   
   Create a `.env` file in the `backend` directory:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

## Running the Application

### Development Mode

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

### Production Mode

1. Build the frontend:
   ```
   cd frontend
   npm run build
   ```

2. Start the backend server:
   ```
   cd backend
   npm start
   ```

## Project Structure

```
shop-app-erp/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── server.js        # Entry point
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── screens/     # Page components
│   │   ├── slices/      # Redux slices
│   │   └── ...
│   └── ...
└── ...
```

## Security Features

- Helmet.js for HTTP header protection
- Express-rate-limit for rate limiting
- Express-validator for input validation
- Winston/Morgan for logging
- JWT-based authentication
- Environment-based configuration

## Testing

- Jest and Supertest for backend testing
- React Testing Library for frontend testing (to be implemented)

Run backend tests:
```
cd backend
npm test
```

## CI/CD

GitHub Actions workflow is configured for:
- Running tests on multiple Node.js versions
- Building the frontend application
- Deploying artifacts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT

## Contact

For support or queries, please open an issue on the GitHub repository.