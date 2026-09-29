const fs = require("fs");
const Document = require("../models/Document");
const Claim = require("../models/Claim");
const { createNotification } = require("../services/notificationService");

// Create document record (metadata)
const createDocument = async (req, res) => {
  try {
    const {
      documentType,
      fileName,
      filePath,
    } = req.body;

    const claim = req.body.claim || req.body.claimId;

    // Check required fields
    if (!claim || !documentType || !fileName || !filePath) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Check claim
    const existingClaim = await Claim.findById(claim);

    if (!existingClaim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    // Customer can only add documents to their own claim
    if (
      req.user.role === "customer" &&
      existingClaim.customer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only add documents to your own claims",
      });
    }

    const document = await Document.create({
      claim,
      documentType,
      fileName,
      filePath,
      uploadedBy: req.user.id,
    });

    res.status(201).json({
      message: "Document created successfully",
      document,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid claim ID",
      });
    }
    console.error(error);
    res.status(500).json({
      message: "Failed to create document",
    });
  }
};

// Get documents
const getDocuments = async (req, res) => {
  try {
    let documents;

    if (req.user.role === "customer") {
      const claims = await Claim.find({
        customer: req.user.id,
      }).select("_id");

      const claimIds = claims.map((claim) => claim._id);

      documents = await Document.find({
        claim: { $in: claimIds },
      })
        .populate("claim")
        .populate("uploadedBy", "name email");
    } else {
      documents = await Document.find()
        .populate("claim")
        .populate("uploadedBy", "name email");
    }

    res.status(200).json({
      documents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get documents",
    });
  }
};

// Get one document
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("claim")
      .populate("uploadedBy", "name email");

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    // Customer can only view documents from their own claims
    if (
      req.user.role === "customer" &&
      document.claim &&
      document.claim.customer &&
      document.claim.customer.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only view documents from your own claims",
      });
    }

    res.status(200).json({
      document,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        message: "Document not found",
      });
    }
    console.error(error);
    res.status(500).json({
      message: "Failed to get document",
    });
  }
};

// Verify or reject document (officer, manager, admin)
const verifyDocument = async (req, res) => {
  try {
    const { verificationStatus, remarks } = req.body;

    const allowedStatuses = ["pending", "verified", "rejected"];
    if (!verificationStatus || !allowedStatuses.includes(verificationStatus)) {
      return res.status(400).json({
        message: "Invalid verification status. Allowed values: pending, verified, rejected",
      });
    }

    // Do not allow customer to verify/reject documents
    if (req.user.role === "customer") {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    document.verificationStatus = verificationStatus;
    if (remarks !== undefined) {
      document.remarks = remarks;
    }

    await document.save();

    await document.populate("claim");
    await document.populate("uploadedBy", "name email");

    // Notify customer on verification or rejection
    if (document.claim && document.claim.customer) {
      const isVerified = verificationStatus === "verified";
      const isRejected = verificationStatus === "rejected";
      if (isVerified || isRejected) {
        await createNotification({
          user: document.claim.customer,
          title: isVerified ? "Document Verified" : "Document Rejected",
          message: isVerified
            ? `Your document (${document.documentType}) has been verified.`
            : `Your document (${document.documentType}) has been rejected.`,
          type: "document",
          claim: document.claim._id,
        });
      }
    }

    const message =
      verificationStatus === "verified"
        ? "Document verified successfully"
        : verificationStatus === "rejected"
        ? "Document rejected successfully"
        : "Document status updated successfully";

    res.status(200).json({
      message,
      document,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({
        message: "Document not found",
      });
    }
    console.error(error);
    res.status(500).json({
      message: "Failed to verify document",
    });
  }
};

// Upload actual file and create document record
const uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    const claim = req.body.claim || req.body.claimId;
    const documentType = req.body.documentType;

    if (!file) {
      return res.status(400).json({
        message: "Please upload a document file",
      });
    }

    if (!claim || !documentType) {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    const existingClaim = await Claim.findById(claim);

    if (!existingClaim) {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    // Customer can only add documents to their own claim
    if (
      req.user.role === "customer" &&
      existingClaim.customer.toString() !== req.user.id
    ) {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(403).json({
        message: "You can only add documents to your own claims",
      });
    }

    const document = await Document.create({
      claim,
      documentType,
      fileName: file.originalname,
      filePath: `/uploads/${file.filename}`,
      uploadedBy: req.user.id,
      verificationStatus: "pending",
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        // ignore
      }
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid claim ID",
      });
    }
    console.error(error);
    res.status(500).json({
      message: "Failed to upload document",
    });
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  verifyDocument,
  uploadDocument,
};