
const { getAllRecords, getRecordById } = require('./record/recordReadController');
const { createRecord, updateRecord, deleteRecord } = require('./record/recordWriteController');
const { getRecordChanges } = require('./record/recordChangeController');

module.exports = {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  getRecordChanges
};
