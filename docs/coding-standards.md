# Coding Standards

This document outlines the coding standards and best practices for the ShopApp project.

## General Principles

1. **Consistency**: Code should look like a single person wrote it
2. **Clarity**: Code should be self-explanatory when possible
3. **Simplicity**: Simple solutions are preferred over complex ones
4. **Maintainability**: Code should be easy to read, understand, and modify

## JavaScript/Node.js Standards

### Naming Conventions

- Variables and functions: `camelCase`
- Classes and constructors: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Private properties: prefixed with underscore `_privateProperty`

### Code Structure

- Use ES6+ features when available
- Prefer `const` over `let`, and `let` over `var`
- Use arrow functions for callbacks and anonymous functions
- Use template literals for string concatenation
- Use destructuring assignment when appropriate

### Example

```javascript
// Good
const MAX_RETRY_COUNT = 3;

class UserService {
  async getUserById(id) {
    const user = await User.findById(id);
    return user;
  }
}

const { name, email } = user;
const greeting = `Hello, ${name}!`;
```

## React/Frontend Standards

### Component Structure

- Use functional components with hooks
- Separate container and presentational components when beneficial
- Use descriptive names for components
- Organize props logically

### State Management

- Use Redux Toolkit for global state
- Use local component state (useState) for ephemeral UI state
- Prefer RTK Query for server state

### File Organization

```
components/
  ├── ComponentName/
  │   ├── ComponentName.jsx
  │   ├── ComponentName.module.css
  │   └── index.js
  └── ...
```

## Backend Structure

### Controllers

Controllers should:
- Handle HTTP requests/responses
- Validate input data
- Call appropriate services
- Handle errors appropriately

```javascript
// Example controller function
const getProducts = async (req, res, next) => {
  try {
    const products = await productService.getAllProducts();
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};
```

### Models

- Use Mongoose schemas
- Define validations
- Include virtuals and methods when appropriate

### Routes

- Group related routes in separate files
- Use consistent naming conventions
- Apply appropriate middleware

## API Design Standards

### RESTful Principles

- Use nouns for resources (not verbs)
- Use plural nouns (`/products` not `/product`)
- Use HTTP methods appropriately:
  - GET for retrieving resources
  - POST for creating resources
  - PUT for updating entire resources
  - PATCH for partial updates
  - DELETE for removing resources

### Response Format

Always use consistent response formats:

Success response:
```json
{
  "success": true,
  "data": {}
}
```

Error response:
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

## Git Workflow

### Branch Naming

- `feature/feature-name` for new features
- `bugfix/issue-description` for bug fixes
- `hotfix/critical-issue` for urgent production fixes
- `release/version-number` for releases

### Commit Messages

Follow conventional commits format:
```
type(scope): description

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance work
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `perf`: Performance improvements

Example:
```
feat(products): add ability to filter products by category

Added category filter to product listing page with corresponding
backend API support

Closes #123
```

## Testing Standards

### Unit Tests

- Test individual functions and components
- Aim for high coverage but prioritize critical paths
- Use descriptive test names
- Mock external dependencies

### Integration Tests

- Test API endpoints
- Test database interactions
- Test authentication flows

### Test Structure

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something', async () => {
    // Test implementation
  });
});
```

## Security Practices

- Never commit secrets or credentials
- Validate and sanitize all user inputs
- Use helmet for Express security headers
- Implement rate limiting
- Use bcrypt for password hashing
- Keep dependencies updated

## Performance Considerations

- Optimize database queries
- Use indexes appropriately
- Implement pagination for large datasets
- Cache expensive operations when appropriate
- Minimize bundle size on frontend