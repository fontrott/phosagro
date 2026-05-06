const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all users
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT user_id, email, full_name, position, department, signature_url, created_at FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT user_id, email, full_name, position, department, signature_url, created_at FROM users WHERE user_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create user
router.post('/', async (req, res) => {
    try {
        const { email, password_hash, full_name, position, department, signature_url } = req.body;
        const [result] = await db.query(
            'INSERT INTO users (email, password_hash, full_name, position, department, signature_url) VALUES (?, ?, ?, ?, ?, ?)',
            [email, password_hash, full_name, position, department, signature_url]
        );
        res.status(201).json({ user_id: result.insertId, message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const { email, full_name, position, department, signature_url } = req.body;
        await db.query(
            'UPDATE users SET email = ?, full_name = ?, position = ?, department = ?, signature_url = ? WHERE user_id = ?',
            [email, full_name, position, department, signature_url, req.params.id]
        );
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
