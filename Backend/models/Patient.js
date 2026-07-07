const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientDetails: {
    fullName: { type: String, required: true },
    age: { type: Number },
    gender: { type: String },
    phoneNumber: { type: String }
  },
  billing: {
    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 }
  },
  visionPrescription: {
    od: {
      sph: String,
      cyl: String,
      axis: String,
      add: String,
      va: String
    },
    os: {
      sph: String,
      cyl: String,
      axis: String,
      add: String,
      va: String
    }
  },
  clinicalNotes: { type: String },
  date: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
