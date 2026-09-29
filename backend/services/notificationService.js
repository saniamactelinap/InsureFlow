const Notification = require("../models/Notification");

/**
 * Helper to create and save a notification
 * @param {Object} params
 * @param {string|mongoose.Types.ObjectId} params.user - Recipient user ID
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} [params.type="general"] - Notification type/category
 * @param {string|mongoose.Types.ObjectId} [params.claim] - Associated claim ID
 * @returns {Promise<Object>} Created notification document
 */
const createNotification = async ({ user, title, message, type = "general", claim }) => {
  try {
    const notification = await Notification.create({
      user,
      title,
      message,
      type,
      claim: claim || undefined,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error.message);
    // Return null rather than failing the core claim transaction
    return null;
  }
};

module.exports = {
  createNotification,
};
