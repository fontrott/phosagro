const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all fonts
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM fonts ORDER BY name');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get font by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM fonts WHERE font_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Font not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create font
router.post('/', async (req, res) => {
    try {
        const { name, file_url } = req.body;
        const [result] = await db.query(
            'INSERT INTO fonts (name, file_url) VALUES (?, ?)',
            [name, file_url]
        );
        res.status(201).json({ font_id: result.insertId, message: 'Font created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update font
router.put('/:id', async (req, res) => {
    try {
        const { name, file_url } = req.body;
        await db.query(
            'UPDATE fonts SET name = ?, file_url = ? WHERE font_id = ?',
            [name, file_url, req.params.id]
        );
        res.json({ message: 'Font updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete font
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM fonts WHERE font_id = ?', [req.params.id]);
        res.json({ message: 'Font deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
