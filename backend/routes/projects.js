const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all projects for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, t.name as template_name, b.file_url as background_url
            FROM projects p
            LEFT JOIN templates t ON p.template_id = t.template_id
            LEFT JOIN backgrounds b ON p.background_id = b.background_id
            WHERE p.user_id = ?
            ORDER BY p.updated_at DESC
        `, [req.params.userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get project by ID with all details
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, t.name as template_name, t.width as template_width, t.height as template_height,
                   b.file_url as background_url, b.is_public as bg_is_public
            FROM projects p
            LEFT JOIN templates t ON p.template_id = t.template_id
            LEFT JOIN backgrounds b ON p.background_id = b.background_id
            WHERE p.project_id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const project = rows[0];

        // Get project objects
        const [objects] = await db.query(`
            SELECT po.*, op.file_url as object_url, op.name as object_name
            FROM project_objects po
            LEFT JOIN objects_pool op ON po.object_id = op.object_id
            WHERE po.project_id = ?
        `, [project.project_id]);
        project.objects = objects;

        // Get project texts
        const [texts] = await db.query(`
            SELECT pt.*, f.name as font_name, f.file_url as font_url
            FROM project_texts pt
            LEFT JOIN fonts f ON pt.font_id = f.font_id
            WHERE pt.project_id = ?
        `, [project.project_id]);
        project.texts = texts;

        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create project
router.post('/', async (req, res) => {
    try {
        const { user_id, name, template_id, orientation, background_id, background_color, status } = req.body;
        const [result] = await db.query(
            `INSERT INTO projects (user_id, name, template_id, orientation, background_id, background_color, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, name, template_id, orientation, background_id, background_color, status || 'draft']
        );
        res.status(201).json({ project_id: result.insertId, message: 'Project created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update project
router.put('/:id', async (req, res) => {
    try {
        const { name, template_id, orientation, background_id, background_color, status } = req.body;
        await db.query(
            `UPDATE projects SET name = ?, template_id = ?, orientation = ?, background_id = ?, 
                    background_color = ?, status = ?, updated_at = NOW() 
             WHERE project_id = ?`,
            [name, template_id, orientation, background_id, background_color, status, req.params.id]
        );
        res.json({ message: 'Project updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete project
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM projects WHERE project_id = ?', [req.params.id]);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add object to project
router.post('/:id/objects', async (req, res) => {
    try {
        const { object_id, pos_x, pos_y, width, height, rotation_angle, z_index, opacity } = req.body;
        await db.query(
            `INSERT INTO project_objects (project_id, object_id, pos_x, pos_y, width, height, rotation_angle, z_index, opacity)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.params.id, object_id, pos_x, pos_y, width, height, rotation_angle || 0, z_index || 1, opacity || 1.0]
        );
        res.status(201).json({ message: 'Object added to project successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update object in project
router.put('/:projectId/objects/:poId', async (req, res) => {
    try {
        const { pos_x, pos_y, width, height, rotation_angle, z_index, opacity } = req.body;
        await db.query(
            `UPDATE project_objects SET pos_x = ?, pos_y = ?, width = ?, height = ?, 
                    rotation_angle = ?, z_index = ?, opacity = ?
             WHERE po_id = ? AND project_id = ?`,
            [pos_x, pos_y, width, height, rotation_angle, z_index, opacity, req.params.poId, req.params.projectId]
        );
        res.json({ message: 'Object updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete object from project
router.delete('/:projectId/objects/:poId', async (req, res) => {
    try {
        await db.query('DELETE FROM project_objects WHERE po_id = ? AND project_id = ?', [req.params.poId, req.params.projectId]);
        res.json({ message: 'Object deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add text to project
router.post('/:id/texts', async (req, res) => {
    try {
        const { content, font_id, font_size, font_color, is_bold, is_italic, pos_x, pos_y, rotation_angle, z_index } = req.body;
        await db.query(
            `INSERT INTO project_texts (project_id, content, font_id, font_size, font_color, is_bold, is_italic, pos_x, pos_y, rotation_angle, z_index)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.params.id, content, font_id, font_size || 14, font_color || '#000000', 
             is_bold || false, is_italic || false, pos_x, pos_y, rotation_angle || 0, z_index || 2]
        );
        res.status(201).json({ message: 'Text added to project successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update text in project
router.put('/:projectId/texts/:ptId', async (req, res) => {
    try {
        const { content, font_id, font_size, font_color, is_bold, is_italic, pos_x, pos_y, rotation_angle, z_index } = req.body;
        await db.query(
            `UPDATE project_texts SET content = ?, font_id = ?, font_size = ?, font_color = ?, 
                    is_bold = ?, is_italic = ?, pos_x = ?, pos_y = ?, rotation_angle = ?, z_index = ?
             WHERE pt_id = ? AND project_id = ?`,
            [content, font_id, font_size, font_color, is_bold, is_italic, pos_x, pos_y, rotation_angle, z_index, 
             req.params.ptId, req.params.projectId]
        );
        res.json({ message: 'Text updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete text from project
router.delete('/:projectId/texts/:ptId', async (req, res) => {
    try {
        await db.query('DELETE FROM project_texts WHERE pt_id = ? AND project_id = ?', [req.params.ptId, req.params.projectId]);
        res.json({ message: 'Text deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
