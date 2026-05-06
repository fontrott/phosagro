const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all content types
router.get('/content-types', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM content_types');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all templates with optional filters
router.get('/', async (req, res) => {
    try {
        const { content_type, category, orientation, is_active } = req.query;
        let query = `
            SELECT t.*, ct.name as content_type_name 
            FROM templates t
            LEFT JOIN content_types ct ON t.content_type_id = ct.content_type_id
            WHERE 1=1
        `;
        const params = [];

        if (content_type) {
            query += ' AND t.content_type_id = ?';
            params.push(content_type);
        }
        if (orientation) {
            query += ' AND t.orientation = ?';
            params.push(orientation);
        }
        if (is_active !== undefined) {
            query += ' AND t.is_active = ?';
            params.push(is_active === 'true' ? 1 : 0);
        }

        const [rows] = await db.query(query, params);
        
        // Get categories for each template
        for (let template of rows) {
            const [cats] = await db.query(`
                SELECT c.category_id, c.name 
                FROM categories c
                JOIN template_categories tc ON c.category_id = tc.category_id
                WHERE tc.template_id = ?
            `, [template.template_id]);
            template.categories = cats;
        }

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get template by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.*, ct.name as content_type_name 
            FROM templates t
            LEFT JOIN content_types ct ON t.content_type_id = ct.content_type_id
            WHERE t.template_id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        const template = rows[0];
        
        // Get categories for template
        const [cats] = await db.query(`
            SELECT c.category_id, c.name 
            FROM categories c
            JOIN template_categories tc ON c.category_id = tc.category_id
            WHERE tc.template_id = ?
        `, [template.template_id]);
        template.categories = cats;

        res.json(template);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create template
router.post('/', async (req, res) => {
    try {
        const { name, content_type_id, orientation, width, height, preview_url, is_active, category_ids } = req.body;
        const [result] = await db.query(
            'INSERT INTO templates (name, content_type_id, orientation, width, height, preview_url, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, content_type_id, orientation, width, height, preview_url, is_active !== false]
        );

        // Add categories if provided
        if (category_ids && category_ids.length > 0) {
            for (const catId of category_ids) {
                await db.query('INSERT INTO template_categories (template_id, category_id) VALUES (?, ?)', [result.insertId, catId]);
            }
        }

        res.status(201).json({ template_id: result.insertId, message: 'Template created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update template
router.put('/:id', async (req, res) => {
    try {
        const { name, content_type_id, orientation, width, height, preview_url, is_active, category_ids } = req.body;
        await db.query(
            'UPDATE templates SET name = ?, content_type_id = ?, orientation = ?, width = ?, height = ?, preview_url = ?, is_active = ? WHERE template_id = ?',
            [name, content_type_id, orientation, width, height, preview_url, is_active !== false, req.params.id]
        );

        // Update categories if provided
        if (category_ids) {
            await db.query('DELETE FROM template_categories WHERE template_id = ?', [req.params.id]);
            for (const catId of category_ids) {
                await db.query('INSERT INTO template_categories (template_id, category_id) VALUES (?, ?)', [req.params.id, catId]);
            }
        }

        res.json({ message: 'Template updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete template
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM templates WHERE template_id = ?', [req.params.id]);
        res.json({ message: 'Template deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
