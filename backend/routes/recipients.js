const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all recipients for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM recipients WHERE user_id = ? ORDER BY full_name',
            [req.params.userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recipient by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM recipients WHERE recipient_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Recipient not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create recipient
router.post('/', async (req, res) => {
    try {
        const { user_id, full_name, email, company_name } = req.body;
        const [result] = await db.query(
            'INSERT INTO recipients (user_id, full_name, email, company_name) VALUES (?, ?, ?, ?)',
            [user_id, full_name, email, company_name]
        );
        res.status(201).json({ recipient_id: result.insertId, message: 'Recipient created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update recipient
router.put('/:id', async (req, res) => {
    try {
        const { full_name, email, company_name } = req.body;
        await db.query(
            'UPDATE recipients SET full_name = ?, email = ?, company_name = ? WHERE recipient_id = ?',
            [full_name, email, company_name, req.params.id]
        );
        res.json({ message: 'Recipient updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete recipient
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM recipients WHERE recipient_id = ?', [req.params.id]);
        res.json({ message: 'Recipient deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all recipient groups for a user
router.get('/groups/user/:userId', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM recipient_groups WHERE user_id = ? ORDER BY name',
            [req.params.userId]
        );
        
        // Get members for each group
        for (let group of rows) {
            const [members] = await db.query(`
                SELECT r.* FROM recipients r
                JOIN recipient_group_members rgm ON r.recipient_id = rgm.recipient_id
                WHERE rgm.group_id = ?
            `, [group.group_id]);
            group.members = members;
        }
        
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create recipient group
router.post('/groups', async (req, res) => {
    try {
        const { user_id, name } = req.body;
        const [result] = await db.query(
            'INSERT INTO recipient_groups (user_id, name) VALUES (?, ?)',
            [user_id, name]
        );
        res.status(201).json({ group_id: result.insertId, message: 'Group created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add recipient to group
router.post('/groups/:groupId/members', async (req, res) => {
    try {
        const { recipient_id } = req.body;
        await db.query(
            'INSERT INTO recipient_group_members (group_id, recipient_id) VALUES (?, ?)',
            [req.params.groupId, recipient_id]
        );
        res.status(201).json({ message: 'Recipient added to group successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove recipient from group
router.delete('/groups/:groupId/members/:recipientId', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM recipient_group_members WHERE group_id = ? AND recipient_id = ?',
            [req.params.groupId, req.params.recipientId]
        );
        res.json({ message: 'Recipient removed from group successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send project to recipient(s)
router.post('/send', async (req, res) => {
    try {
        const { project_id, recipient_id, group_id } = req.body;
        
        if (!project_id || (!recipient_id && !group_id)) {
            return res.status(400).json({ error: 'project_id and either recipient_id or group_id are required' });
        }

        const sendings = [];

        if (recipient_id) {
            // Send to single recipient
            const [result] = await db.query(
                'INSERT INTO project_sendings (project_id, recipient_id) VALUES (?, ?)',
                [project_id, recipient_id]
            );
            sendings.push({ sending_id: result.insertId, recipient_id });
        }

        if (group_id) {
            // Send to all recipients in group
            const [members] = await db.query(
                'SELECT recipient_id FROM recipient_group_members WHERE group_id = ?',
                [group_id]
            );

            for (const member of members) {
                const [result] = await db.query(
                    'INSERT INTO project_sendings (project_id, recipient_id, group_id) VALUES (?, ?, ?)',
                    [project_id, member.recipient_id, group_id]
                );
                sendings.push({ sending_id: result.insertId, recipient_id: member.recipient_id, group_id });
            }
        }

        res.status(201).json({ 
            message: 'Project sent successfully',
            sendings: sendings
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get sending history for a project
router.get('/sendings/project/:projectId', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT ps.*, r.full_name as recipient_name, r.email as recipient_email,
                   rg.name as group_name
            FROM project_sendings ps
            LEFT JOIN recipients r ON ps.recipient_id = r.recipient_id
            LEFT JOIN recipient_groups rg ON ps.group_id = rg.group_id
            WHERE ps.project_id = ?
            ORDER BY ps.sent_at DESC
        `, [req.params.projectId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
