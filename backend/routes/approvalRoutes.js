const express = require("express");
const {
  createApproval,
  getApprovals,
  getApprovalById,
} = require("../controllers/approvalController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all approvals (manager, admin, officer)
router.get(
  "/",
  protect,
  authorizeRoles("manager", "admin", "officer"),
  getApprovals
);

// Get single approval by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("manager", "admin", "officer"),
  getApprovalById
);

// Create / record approval decision via approval routes
router.post(
  "/",
  protect,
  authorizeRoles("manager", "admin"),
  createApproval
);
router.put(
  "/:id",
  protect,
  authorizeRoles("manager", "admin"),
  createApproval
);
router.put(
  "/claims/:id/approval",
  protect,
  authorizeRoles("manager", "admin"),
  createApproval
);

module.exports = router;
