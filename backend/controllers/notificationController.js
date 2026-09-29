const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// @desc    Get logged in user's notifications
// @route   GET /api/notifications
// @access  Private (customer, officer, surveyor, manager, admin)
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate("claim", "claimNumber status claimAmount approvedAmount")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (customer, officer, surveyor, manager, admin)
const markNotificationAsRead = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Security check: Must belong to logged in user
    if (notification.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this notification",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// @desc    Mark all unread notifications for the user as read
// @route   PUT /api/notifications/read-all
// @access  Private (customer, officer, surveyor, manager, admin)
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      updatedCount: result.modifiedCount,
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
