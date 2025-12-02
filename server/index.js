const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// Database setup
const db = new sqlite3.Database('./car_rental.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite database');
});

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    price_per_day REAL NOT NULL,
    category TEXT NOT NULL,
    transmission TEXT NOT NULL,
    seats INTEGER NOT NULL,
    fuel_type TEXT NOT NULL,
    image_url TEXT,
    available BOOLEAN DEFAULT 1,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    car_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (car_id) REFERENCES cars(id)
  )`);

  // Insert sample cars
  const sampleCars = [
    ['Toyota', 'Camry', 2023, 50, 'Sedan', 'Automatic', 5, 'Petrol', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500', 1, 'Comfortable sedan perfect for city driving'],
    ['Honda', 'CR-V', 2023, 65, 'SUV', 'Automatic', 7, 'Hybrid', 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500', 1, 'Spacious SUV ideal for family trips'],
    ['BMW', '3 Series', 2024, 90, 'Luxury', 'Automatic', 5, 'Petrol', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500', 1, 'Premium luxury sedan with advanced features'],
    ['Tesla', 'Model 3', 2024, 85, 'Electric', 'Automatic', 5, 'Electric', 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500', 1, 'Eco-friendly electric vehicle with autopilot'],
    ['Ford', 'Mustang', 2023, 95, 'Sports', 'Manual', 4, 'Petrol', 'https://images.unsplash.com/photo-1584345604476-8ec5f5d3e0c0?w=500', 1, 'Powerful sports car for thrill seekers'],
    ['Hyundai', 'Venue', 2023, 45, 'Compact SUV', 'Automatic', 5, 'Petrol', 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=500', 1, 'Compact and efficient city SUV']
  ];

  const stmt = db.prepare('INSERT OR IGNORE INTO cars (brand, model, year, price_per_day, category, transmission, seats, fuel_type, image_url, available, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  sampleCars.forEach(car => stmt.run(car));
  stmt.finalize();
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }
        res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });
});

// Car routes
app.get('/api/cars', (req, res) => {
  const { category, minPrice, maxPrice, transmission } = req.query;
  let query = 'SELECT * FROM cars WHERE available = 1';
  const params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (minPrice) {
    query += ' AND price_per_day >= ?';
    params.push(minPrice);
  }
  if (maxPrice) {
    query += ' AND price_per_day <= ?';
    params.push(maxPrice);
  }
  if (transmission) {
    query += ' AND transmission = ?';
    params.push(transmission);
  }
  
  db.all(query, params, (err, cars) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch cars' });
    res.json(cars);
  });
});

app.get('/api/cars/:id', (req, res) => {
  db.get('SELECT * FROM cars WHERE id = ?', [req.params.id], (err, car) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch car' });
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
  });
});

// Booking routes
app.post('/api/bookings', authenticateToken, (req, res) => {
  const { car_id, start_date, end_date } = req.body;
  const user_id = req.user.id;
  
  // Calculate total price
  db.get('SELECT price_per_day FROM cars WHERE id = ?', [car_id], (err, car) => {
    if (err || !car) return res.status(400).json({ error: 'Car not found' });
    
    const days = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24));
    const total_price = car.price_per_day * days;
    
    db.run('INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price) VALUES (?, ?, ?, ?, ?)',
      [user_id, car_id, start_date, end_date, total_price],
      function(err) {
        if (err) return res.status(500).json({ error: 'Booking failed' });
        res.status(201).json({ message: 'Booking created successfully', bookingId: this.lastID, total_price });
      }
    );
  });
});

app.get('/api/bookings/user', authenticateToken, (req, res) => {
  db.all(`SELECT b.*, c.brand, c.model, c.image_url 
          FROM bookings b 
          JOIN cars c ON b.car_id = c.id 
          WHERE b.user_id = ? 
          ORDER BY b.created_at DESC`,
    [req.user.id],
    (err, bookings) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch bookings' });
      res.json(bookings);
    }
  );
});

app.get('/api/bookings/:id', authenticateToken, (req, res) => {
  db.get(`SELECT b.*, c.brand, c.model, c.image_url, c.price_per_day 
          FROM bookings b 
          JOIN cars c ON b.car_id = c.id 
          WHERE b.id = ? AND b.user_id = ?`,
    [req.params.id, req.user.id],
    (err, booking) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch booking' });
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      res.json(booking);
    }
  );
});

// Admin routes
app.get('/api/admin/bookings', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  
  db.all(`SELECT b.*, c.brand, c.model, u.name as user_name, u.email as user_email 
          FROM bookings b 
          JOIN cars c ON b.car_id = c.id 
          JOIN users u ON b.user_id = u.id 
          ORDER BY b.created_at DESC`,
    (err, bookings) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch bookings' });
      res.json(bookings);
    }
  );
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
