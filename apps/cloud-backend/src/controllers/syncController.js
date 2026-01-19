const syncService = require('../services/syncService');

const push = async (req, res) => {
    try {
        const { items } = req.body;
        const { rid } = req.user; // AuthMiddleware dan keladi

        if (!rid) return res.status(400).json({ error: 'Restaurant ID not found in token' });

        const result = await syncService.pushData(rid, items);
        res.json(result);

    } catch (error) {
        console.error("Sync Push Error:", error.message);
        res.status(500).json({ error: 'Server Error during sync' });
    }
};

const pull = async (req, res) => {
    try {
        const { last_sync } = req.query;
        const { rid } = req.user;

        if (!rid) return res.status(400).json({ error: 'Restaurant ID not found' });

        const result = await syncService.pullData(rid, last_sync);
        res.json(result);

    } catch (error) {
        console.error("Sync Pull Error:", error.message);
        res.status(500).json({ error: 'Server Error during pull' });
    }
};

module.exports = {
    push,
    pull
};
