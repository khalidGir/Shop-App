# ShopApp Backend

This is the backend API for ShopApp, a full-featured ERP system designed for small to medium-sized retail businesses and wholesalers.

## Features

- User authentication with JWT
- Role-based access control
- Product inventory management
- Customer and supplier management
- Order processing
- Financial reporting
- Expense tracking
- Real-time inventory monitoring

## Prerequisites

- Node.js v14 or higher
- MongoDB instance (local or cloud)
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the backend directory:
   ```
   cd backend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

## Available Scripts

- `npm start` - Run the server in production mode
- `npm run dev` - Run the server in development mode with nodemon
- `npm test` - Run the test suite

## API Endpoints

All API endpoints are prefixed with `/api`. Here are some of the main routes:

- `/api/users` - User management
- `/api/products` - Product management
- `/api/orders` - Order processing
- `/api/customers` - Customer management
- `/api/suppliers` - Supplier management
- `/api/expenses` - Expense tracking
- `/api/finance` - Financial reports
- `/api/inventory` - Inventory operations

## Security Features

- Helmet.js for HTTP header security
- Express-rate-limit for rate limiting
- Express-validator for input validation
- Winston/Morgan for logging
- JWT-based authentication

## Testing

The project uses Jest and Supertest for testing. Run tests with:

```
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT