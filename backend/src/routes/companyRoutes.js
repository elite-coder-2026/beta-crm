const express = require('express');
const router = express.Router();
const {
    getAll,
    getById,
    create,
    update,
    deleteCompany
} = require('../controllers/companyController');

// Company routes
router.get('/companies', getAll);
router.get('/companies/:id', getById);
router.post('/companies', create);
router.put('/companies/:id', update);
router.delete('/companies/:id', deleteCompany);

module.exports = router;