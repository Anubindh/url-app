const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');
const auth = require('../middleware/auth');

router.get('/links', auth, linkController.getLinks);
router.get('/links/add', auth, linkController.showAddForm);
router.post('/links/add', auth, linkController.addLink);
router.get('/links/delete/:id', auth, linkController.deleteLink);

module.exports = router;
