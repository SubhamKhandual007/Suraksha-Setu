const Activity = require('../models/Activity');

class ActivityService {
  /**
   * Log a new activity
   * @param {Object} data Activity data
   */
  async log(data) {
    try {
      const activity = new Activity({
        user: data.userId,
        digitalId: data.digitalId,
        userName: data.userName,
        type: data.type,
        action: data.action,
        details: data.details || {},
        status: data.status || 'INFO',
        timestamp: data.timestamp || new Date()
      });

      await activity.save();
      console.log(`[Activity Logged] ${data.type}: ${data.action}`);
      return activity;
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error to prevent interrupting the main flow
      return null;
    }
  }

  /**
   * Get recent activities
   * @param {number} limit Number of activities to return
   */
  async getRecent(limit = 10) {
    try {
      return await Activity.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('user', 'name email role');
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      return [];
    }
  }
}

module.exports = new ActivityService();
