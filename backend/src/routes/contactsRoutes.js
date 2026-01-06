const express = require('express');
const router = express.Router();
const {
    deleteContact,
    getAll,
    getById,
    getStats,
    update,
    create,
    searchContacts,
    checkDuplicates,
    findSimilar,
    mergeContacts,
    exportContacts,
    importContacts
} = require('../controllers/contactController');

// Contact routes
router.get('/contacts/search', searchContacts);       // Must be before :id route
router.get('/contacts/stats', getStats);              // Must be before :id route
router.get('/contacts/export', exportContacts);       // Must be before :id route
router.get('/contacts/find-similar', findSimilar);    // Must be before :id route
router.post('/contacts/check-duplicates', checkDuplicates);
router.post('/contacts/merge', mergeContacts);
router.post('/contacts/import', importContacts);
router.get('/contacts', getAll);
router.get('/contacts/:id', getById);
router.post('/contacts', create);
router.put('/contacts/:id', update);
router.delete('/contacts/:id', deleteContact);

module.exports = router;