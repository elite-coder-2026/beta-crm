const express = require('express')
const router = express.Router()

import {
    delete_contact,
    getAll, getStats,
} from '../controllers/contactController'
router.get('/contacts', getAll);
router.get('/contacts/stats', getStats);
router.delete('/contacts/:id', delete_contact)