const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} = require("../controllers/policyController");

const router = express.Router();

// Any authenticated user (customer/officer/surveyor/manager/admin) can view policies.
// getPolicies() automatically limits a customer to their own policies.
router.get("/", protect, getPolicies);
router.get("/:id", protect, getPolicyById);

// Only admins can create, update or delete policies
router.post("/", protect, authorizeRoles("admin"), createPolicy);
router.put("/:id", protect, authorizeRoles("admin"), updatePolicy);
router.delete("/:id", protect, authorizeRoles("admin"), deletePolicy);

module.exports = router;
