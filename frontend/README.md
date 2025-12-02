# ShopApp Frontend

This is the frontend for ShopApp, a full-featured ERP system designed for small to medium-sized retail businesses and wholesalers.

## Features

- Responsive user interface with React Bootstrap
- Role-based dashboard views
- Real-time inventory monitoring
- Order management system
- Customer and supplier management
- Financial reporting and analytics
- Expense tracking
- PDF invoice generation

## Prerequisites

- Node.js v14 or higher
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the frontend directory:
   ```
   cd frontend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Ensure the backend server is running and update the API URL in the configuration if needed.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint to check for code issues
- `npm run preview` - Preview the production build locally

## Project Structure

- `/src/components` - Reusable UI components
- `/src/screens` - Page-level components
- `/src/slices` - Redux Toolkit slices for state management
- `/src/assets` - Static assets like images and icons

## Technologies Used

- React 18 with hooks
- Redux Toolkit with RTK Query for state management
- React Router for navigation
- React Bootstrap for UI components
- Vite as the build tool
- ESLint for code quality

## Code Quality

- ESLint is configured with React and JavaScript best practices
- React Hooks linting rules are enforced
- React Refresh plugin helps maintain state during development

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT