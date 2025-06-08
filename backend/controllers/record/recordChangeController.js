
const ActivityLogService = require('../../services/activityLogService');

// Get record changes/history
const getRecordChanges = async (req, res) => {
  try {
    const { id } = req.params;
    
    const changes = await ActivityLogService.getRecordChanges(id);
    res.json(changes);
    
  } catch (error) {
    console.error('Error fetching record changes:', error);
    res.status(500).json({ error: 'Failed to fetch record changes' });
  }
};

module.exports = {
  getRecordChanges
};
