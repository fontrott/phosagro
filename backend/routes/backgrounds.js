const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/backgrounds/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'bg-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Get all backgrounds
router.get('/', async (req, res) => {
    try {
        const { is_public, created_by } = req.query;
        let query = 'SELECT * FROM backgrounds WHERE 1=1';
        const params = [];

        if (is_public !== undefined) {
            query += ' AND is_public = ?';
            params.push(is_public === 'true' ? 1 : 0);
        }
        if (created_by) {
            query += ' AND (is_public = 1 OR created_by = ?)';
            params.push(created_by);
        }

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get background by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM backgrounds WHERE background_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Background not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload new background
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { is_public, created_by } = req.body;
        const file_url = `/uploads/backgrounds/${req.file.filename}`;
        
        const [result] = await db.query(
            'INSERT INTO backgrounds (file_url, is_public, created_by) VALUES (?, ?, ?)',
            [file_url, is_public !== false, created_by || null]
        );
        
        res.status(201).json({ 
            background_id: result.insertId, 
            file_url: file_url,
            message: 'Background uploaded successfully' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create background with URL
router.post('/', async (req, res) => {
    try {
        const { file_url, is_public, created_by } = req.body;
        const [result] = await db.query(
            'INSERT INTO backgrounds (file_url, is_public, created_by) VALUES (?, ?, ?)',
            [file_url, is_public !== false, created_by]
        );
        res.status(201).json({ background_id: result.insertId, message: 'Background created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update background
router.put('/:id', async (req, res) => {
    try {
        const { is_public } = req.body;
        await db.query(
            'UPDATE backgrounds SET is_public = ? WHERE background_id = ?',
            [is_public !== false, req.params.id]
        );
        res.json({ message: 'Background updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete background
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM backgrounds WHERE background_id = ?', [req.params.id]);
        res.json({ message: 'Background deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
