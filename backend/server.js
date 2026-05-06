const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
const db = require('./config/database');

// Routes
const usersRoutes = require('./routes/users');
const templatesRoutes = require('./routes/templates');
const projectsRoutes = require('./routes/projects');
const objectsRoutes = require('./routes/objects');
const backgroundsRoutes = require('./routes/backgrounds');
const fontsRoutes = require('./routes/fonts');
const recipientsRoutes = require('./routes/recipients');
const exportsRoutes = require('./routes/exports');

// Use routes
app.use('/api/users', usersRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/objects', objectsRoutes);
app.use('/api/backgrounds', backgroundsRoutes);
app.use('/api/fonts', fontsRoutes);
app.use('/api/recipients', recipientsRoutes);
app.use('/api/exports', exportsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
