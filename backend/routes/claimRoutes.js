const express = require("express");

const {
  createClaim,
  getClaims,
  getClaimById,
} = require("../controllers/claimController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new claim
router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createClaim
);

// Get all claims / customer's own claims
router.get(
  "/",
  protect,
  authorizeRoles("customer", "officer", "surveyor", "manager", "admin"),
  getClaims
);

// Get one claim
router.get(
  "/:id",
  protect,
  authorizeRoles("customer", "officer", "surveyor", "manager", "admin"),
  getClaimById
);

module.exports = router;