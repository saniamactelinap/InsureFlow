const express = require("express");
const {
  createDocument,
  getDocuments,
  getDocumentById,
  verifyDocument,
  uploadDocument,
} = require("../controllers/documentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { uploadSingleDocument } = require("../middleware/uploadMiddleware");

const router = express.Router();

// Upload document with actual file (Customer only)
router.post(
  "/upload",
  protect,
  authorizeRoles("customer"),
  uploadSingleDocument,
  uploadDocument
);

// Create document metadata (Customer only)
router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createDocument
);

// Get documents (Customer sees own claim docs; officer/surveyor/manager/admin see all)
router.get(
  "/",
  protect,
  authorizeRoles("customer", "officer", "surveyor", "manager", "admin"),
  getDocuments
);

// Get single document by ID
router.get(
  "/:id",
  protect,
  authorizeRoles("customer", "officer", "surveyor", "manager", "admin"),
  getDocumentById
);

// Verify or reject document (officer, manager, admin only)
router.put(
  "/:id/verify",
  protect,
  authorizeRoles("officer", "manager", "admin"),
  verifyDocument
);

module.exports = router;
