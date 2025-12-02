# Car Rental System

A full-stack car rental application built with React, Node.js, Express, and SQLite.

## Features

- 🚗 Browse available cars with filtering options
- 🔍 Search by category, transmission, and price range
- 📅 Book cars for specific date ranges
- 👤 User authentication (register/login)
- 📊 User dashboard to manage bookings
- 💳 Automatic price calculation based on rental duration
- 📱 Responsive design with Tailwind CSS

## Tech Stack

**Frontend:**
- React 18
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- Vite for build tooling

**Backend:**
- Node.js
- Express.js
- SQLite database
- JWT authentication
- bcryptjs for password hashing

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kajal1428-ui/car-rental-system.git
cd car-rental-system
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory:
```
PORT=3000
JWT_SECRET=your-secret-key-here
```

## Running the Application

### Development Mode

1. Start the backend server:
```bash
npm run dev
```

2. In a new terminal, start the frontend:
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Production Mode

1. Build the frontend:
```bash
cd client
npm run build
cd ..
```

2. Start the server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Database

The application uses SQLite with the following tables:
- **users**: User accounts and authentication
- **cars**: Available vehicles for rent
- **bookings**: Rental bookings

Sample cars are automatically inserted on first run.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Cars
- `GET /api/cars` - Get all available cars (with filters)
- `GET /api/cars/:id` - Get car details

### Bookings
- `POST /api/bookings` - Create new booking (authenticated)
- `GET /api/bookings/user` - Get user's bookings (authenticated)
- `GET /api/bookings/:id` - Get booking details (authenticated)

## Default Credentials

You can register a new account or use the sample data after registration.

## License

MIT
