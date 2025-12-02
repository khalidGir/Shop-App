# Deployment Guide

This guide covers deploying ShopApp to production environments.

## Production Requirements

- Node.js v14 or higher
- MongoDB database (v4.0 or higher)
- Reverse proxy server (Nginx recommended)
- SSL certificate for HTTPS

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

This creates a production-ready build in the `dist/` directory.

### Backend Configuration

Ensure the following environment variables are set in production:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_production_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

## Deployment Options

### Option 1: Traditional Deployment

1. Deploy MongoDB (MongoDB Atlas or self-hosted)
2. Upload backend code to server
3. Install dependencies:
   ```bash
   cd backend
   npm install --production
   ```
4. Start the backend:
   ```bash
   node server.js
   ```
   Or use PM2:
   ```bash
   pm2 start server.js
   ```

5. Build and deploy frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
6. Serve frontend build via Nginx/Apache

### Option 2: Docker Deployment

Using the provided docker-compose.yml:

```bash
docker-compose up -d
```

This will start both frontend and backend services along with MongoDB.

## Nginx Configuration

Sample Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment-Specific Configurations

### MongoDB Connection

For production, use a secure MongoDB connection string:

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### JWT Secret

Generate a strong JWT secret for production:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Security Considerations

1. Always use HTTPS in production
2. Set secure headers in Nginx:
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN" always;
   add_header X-XSS-Protection "1; mode=block" always;
   add_header X-Content-Type-Options "nosniff" always;
   ```
3. Regularly update dependencies
4. Implement proper firewall rules
5. Use strong passwords for all services

## Monitoring and Logging

- Enable application logging
- Set up log rotation
- Monitor server resources
- Configure error tracking
- Set up uptime monitoring

## Backup Strategy

1. Regular MongoDB backups
2. Backup environment configurations
3. Version control for source code
4. Document recovery procedures

## Scaling Considerations

- Load balancing for multiple instances
- Database connection pooling
- CDN for static assets
- Caching strategies
- Database indexing for performance