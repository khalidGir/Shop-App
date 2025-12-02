# API Documentation

This document provides an overview of the ShopApp RESTful API. For detailed endpoint information, please refer to the interactive Swagger documentation available at `/api-docs` when running the application.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most API endpoints require authentication via JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Auth Routes
- `POST /auth/login` - User login
- `POST /auth/register` - User registration (admin only)
- `GET /auth/profile` - Get current user profile
- `PUT /auth/profile` - Update user profile

### User Routes
- `GET /users` - Get all users (admin only)
- `POST /users` - Create new user (admin only)
- `GET /users/:id` - Get specific user (admin only)
- `PUT /users/:id` - Update user (admin only)
- `DELETE /users/:id` - Delete user (admin only)

### Product Routes
- `GET /products` - Get all products
- `POST /products` - Create new product
- `GET /products/:id` - Get specific product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Customer Routes
- `GET /customers` - Get all customers
- `POST /customers` - Create new customer
- `GET /customers/:id` - Get specific customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Supplier Routes
- `GET /suppliers` - Get all suppliers
- `POST /suppliers` - Create new supplier
- `GET /suppliers/:id` - Get specific supplier
- `PUT /suppliers/:id` - Update supplier
- `DELETE /suppliers/:id` - Delete supplier

### Order Routes
- `GET /orders` - Get all orders
- `POST /orders` - Create new order
- `GET /orders/:id` - Get specific order
- `PUT /orders/:id` - Update order
- `DELETE /orders/:id` - Delete order

### Invoice Routes
- `GET /invoices` - Get all invoices
- `POST /invoices` - Create new invoice
- `GET /invoices/:id` - Get specific invoice
- `PUT /invoices/:id` - Update invoice
- `DELETE /invoices/:id` - Delete invoice
- `GET /invoices/:id/download` - Download invoice PDF

### Payment Routes
- `GET /payments` - Get all payments
- `POST /payments` - Create new payment
- `GET /payments/:id` - Get specific payment
- `PUT /payments/:id` - Update payment
- `DELETE /payments/:id` - Delete payment

### Expense Routes
- `GET /expenses` - Get all expenses
- `POST /expenses` - Create new expense
- `GET /expenses/:id` - Get specific expense
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense

### Purchase Routes
- `GET /purchases` - Get all purchases
- `POST /purchases` - Create new purchase
- `GET /purchases/:id` - Get specific purchase
- `PUT /purchases/:id` - Update purchase
- `DELETE /purchases/:id` - Delete purchase

### Inventory Routes
- `GET /inventory` - Get inventory summary
- `GET /inventory/movements` - Get stock movements
- `POST /inventory/movements` - Create stock movement

### Dashboard Routes
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/charts` - Get chart data

### Finance Routes
- `GET /finance/profit-loss` - Get profit and loss report
- `GET /finance/cash-flow` - Get cash flow report
- `GET /finance/aging` - Get account aging report

## Response Format

Successful responses follow this format:

```json
{
  "success": true,
  "data": {}
}
```

Error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently, rate limiting is not implemented but will be added in future versions for security purposes.