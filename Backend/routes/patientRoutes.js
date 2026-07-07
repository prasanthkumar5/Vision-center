const express = require('express');
const router = express.Router();
const { createPatient, getPatients, updatePatient, deletePatient } = require('../controllers/patientController');

router.route('/')
  .post(createPatient)
  .get(getPatients);

router.route('/:id')
  .put(updatePatient)
  .delete(deletePatient);

module.exports = router;
