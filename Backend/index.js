const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');

// Import Routes
const patientRoutes = require('./routes/patientRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ---> THIS IS THE DB CONNECTION CODE <---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Vision Center Backend is running');
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Seed default admin user for testing
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const adminExists = await User.findOne({ email: 'admin@visioncare.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      await User.create({
        name: 'Dr. Admin',
        email: 'admin@visioncare.com',
        password: hashedPassword,
        role: 'Head Optometrist'
      });
      console.log('Default admin user created: admin@visioncare.com / password123');
    }
  } catch (err) {
    console.error('Error seeding admin user:', err);
  }
});
