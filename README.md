# 🚀 ShopApp - Advanced E-commerce ERP & Management System

> **A full-stack business management solution that goes beyond simple e-commerce. It integrates advanced Inventory Intelligence, Financial Analytics, and CRM capabilities into a seamless MERN stack application.**

![Dashboard Preview](screenshots/dashboard_preview.png)
*(Place your main dashboard screenshot here)*

## 📖 Overview

ShopApp is designed for businesses that need more than just a storefront. It solves real-world operational challenges by bridging the gap between **Sales**, **Inventory**, and **Finance**. Unlike standard e-commerce templates, this system handles complex business logic like **Credit Sales Management**, **Stock Movement Auditing**, and **Financial Aging Reports**.

## ✨ Key Features

### 📦 Inventory Intelligence
*   **Real-time Stock Tracking**: Automatically logs every stock movement (Sales, Purchases, Adjustments).
*   **Smart Alerts**: Visual indicators for low stock and reorder points.
*   **Analytics**: Calculates Inventory Turnover and Stock Value dynamically.

### 💰 Financial Command Center
*   **Aging Reports**: Tracks overdue invoices (0-30, 31-60, 90+ days) to manage accounts receivable.
*   **Cash Flow Visualization**: Interactive charts showing daily inflows vs. outflows.
*   **Profit & Loss**: Automated calculation of Revenue, COGS, and Net Profit.

### 🤝 CRM & Credit Management
*   **Credit System**: Set individual credit limits for customers.
*   **Balance Tracking**: Real-time tracking of customer debt and payment history.
*   **Safety Checks**: Automatically blocks sales if a customer exceeds their credit limit.

### 🧾 Sales & Invoicing
*   **Professional Invoicing**: Generate, print, and email PDF invoices directly from the browser.
*   **POS Interface**: Streamlined sales screen for quick order processing.

## 🛠️ Tech Stack

*   **Frontend**: React.js, Redux Toolkit (RTK Query), React Bootstrap, Chart.js
*   **Backend**: Node.js, Express.js, MongoDB (Mongoose Aggregations)
*   **Tools**: JWT Authentication, Multer (Image Uploads), React-To-Print

## 📸 Screenshots

| **Inventory Analytics** | **Financial Reports** |
|:---:|:---:|
| ![Inventory](screenshots/inventory.png) | ![Finance](screenshots/finance.png) |
| *Track stock movements and value* | *Visualize cash flow and aging* |

| **Customer Credit Profile** | **Sales & POS** |
|:---:|:---:|
| ![Customer](screenshots/customer.png) | ![Sales](screenshots/sales.png) |
| *Manage credit limits and balances* | *Quick checkout with credit checks* |

## 🚀 Getting Started

### Prerequisites
*   Node.js (v14+)
*   MongoDB (Local or Atlas)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/shop-app-erp.git
    cd shop-app-erp
    ```

2.  **Install Dependencies**
    ```bash
    # Install backend dependencies
    cd backend
    npm install

    # Install frontend dependencies
    cd ../frontend
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the `backend` folder:
    ```env
    NODE_ENV=development
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

4.  **Run the App**
    ```bash
    # Run backend and frontend concurrently (from root if configured, or separately)
    # Terminal 1 (Backend)
    cd backend
    npm run server

    # Terminal 2 (Frontend)
    cd frontend
    npm run dev
    ```

## 🔮 Future Improvements
*   Integration with Stripe/PayPal for online payments.
*   Multi-warehouse support.
*   AI-driven demand forecasting.

---
*Built with ❤️ by Khalid Girma
