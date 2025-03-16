const express = require('express');
const { runWorkItem, getWorkItemStatus } = require('../services/aps.js');
const bodyParser = require('body-parser');

let router = express.Router();

router.use(bodyParser.json());

router.post('/api/da/:hubId/:fileItemId', async function (req, res, next) {
    try {
        const workItem = await runWorkItem(req.params.hubId, req.params.fileItemId, req.body);
        res.json(workItem);
    } catch (err) {
        next(err);
    }
});

router.get('/api/da/:workItemId', async function (req, res, next) {
    try {
        const workItem = await getWorkItemStatus(req.params.workItemId);
        res.json(workItem);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
