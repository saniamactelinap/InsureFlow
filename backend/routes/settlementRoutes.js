const express = require("express");
const {
  createSettlement,
  getSettlements,
  getSettlementById,
  updateSettlementStatus,
  closeSettlement,
} = require("../controllers/settlementController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Create settlement (officer, manager, admin)
router.post(
  "/",
  protect,
  authorizeRoles("officer", "manager", "admin"),
  createSettlement
);

// Get all settlements (officer, manager, admin)
router.get(
  "/",
  protect,
  authorizeRoles("officer", "manager", "admin"),
  getSettlements
);

// Get single settlement by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("officer", "manager", "admin"),
  getSettlementById
);

// Update settlement status (officer, manager, admin)
router.put(
  "/:id/status",
  protect,
  authorizeRoles("officer", "manager", "admin"),
  updateSettlementStatus
);

// Close claim after settlement completed (manager, admin only)
router.put(
  "/:id/close",
  protect,
  authorizeRoles("manager", "admin"),
  closeSettlement
);

module.exports = router;
