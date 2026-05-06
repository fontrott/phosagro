const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all exports for a project
router.get('/project/:projectId', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM exports WHERE project_id = ? ORDER BY created_at DESC',
            [req.params.projectId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get export by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM exports WHERE export_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Export not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create export record
router.post('/', async (req, res) => {
    try {
        const { project_id, format, file_url } = req.body;
        
        if (!['png', 'jpg', 'jpeg'].includes(format)) {
            return res.status(400).json({ error: 'Invalid format. Must be png, jpg, or jpeg' });
        }

        const [result] = await db.query(
            'INSERT INTO exports (project_id, format, file_url) VALUES (?, ?, ?)',
            [project_id, format, file_url]
        );
        
        res.status(201).json({ 
            export_id: result.insertId, 
            message: 'Export created successfully',
            file_url: file_url
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete export
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM exports WHERE export_id = ?', [req.params.id]);
        res.json({ message: 'Export deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
