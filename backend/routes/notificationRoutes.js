const express = require("express");
const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

const allowedRoles = ["customer", "officer", "surveyor", "manager", "admin"];

// Get logged-in user's notifications
router.get("/", protect, authorizeRoles(...allowedRoles), getMyNotifications);

// Mark all notifications as read
router.put(
  "/read-all",
  protect,
  authorizeRoles(...allowedRoles),
  markAllNotificationsAsRead
);

// Mark single notification as read
router.put(
  "/:id/read",
  protect,
  authorizeRoles(...allowedRoles),
  markNotificationAsRead
);

module.exports = router;
