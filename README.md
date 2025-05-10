# Restaurant Management System

A comprehensive web application for restaurant management, including user ordering system and admin dashboard.

## Features

- User Features:
  - User registration and authentication
  - Browse restaurant menu
  - Place orders
  - Track order status
  - Shopping cart functionality
  - User profile management

- Admin Features:
  - Admin authentication
  - Real-time order management
  - Menu management
  - User management
  - Sales analytics
  - Inventory tracking

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MSSQL
- Authentication: JWT
- File Upload: Multer
- Logging: Winston

## Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Create .env file in backend directory with required environment variables
4. Start the backend server:
   ```bash
   npm start
   ```
5. Open the frontend files in your browser

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
JWT_SECRET=your_jwt_secret
PORT=3000
```

## API Documentation

The API documentation is available at `/api-docs` when running the server.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 