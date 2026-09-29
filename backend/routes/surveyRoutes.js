const express = require("express");
const {
  assignSurveyor,
  getAssignedClaims,
  createSurveyReport,
  getSurveyReports,
  getSurveyReportById,
  reviewSurveyReport,
} = require("../controllers/surveyController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Get claims assigned to logged-in surveyor
router.get(
  "/assigned",
  protect,
  authorizeRoles("surveyor"),
  getAssignedClaims
);

// Create survey report (surveyor only)
router.post(
  "/",
  protect,
  authorizeRoles("surveyor"),
  createSurveyReport
);

// Get survey reports (surveyor sees own; officer/manager/admin see all)
router.get(
  "/",
  protect,
  authorizeRoles("surveyor", "officer", "manager", "admin"),
  getSurveyReports
);

// Get single survey report by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("surveyor", "officer", "manager", "admin"),
  getSurveyReportById
);

// Review survey report (officer, manager, admin only)
router.put(
  "/:id/review",
  protect,
  authorizeRoles("officer", "manager", "admin"),
  reviewSurveyReport
);

// Assign surveyor to claim via /api/surveys/:id/assign-surveyor or /api/surveys/claims/:id/assign-surveyor
router.put(
  "/:id/assign-surveyor",
  protect,
  authorizeRoles("officer", "manager", "admin"),
  assignSurveyor
);
router.put(
  "/claims/:id/assign-surveyor",
  protect,
  authorizeRoles("officer", "manager", "admin"),
  assignSurveyor
);

module.exports = router;
