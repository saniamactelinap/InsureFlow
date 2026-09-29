const mongoose = require("mongoose");
const Approval = require("../models/Approval");
const Claim = require("../models/Claim");
const ClaimHistory = require("../models/ClaimHistory");

// Create manager decision on claim (manager, admin)
const createApproval = async (req, res) => {
  try {
    const { decision, approvedAmount, remarks, comments } = req.body;
    const targetClaimId = req.params.id || req.body.claim || req.body.claimId;

    if (!targetClaimId) {
      return res.status(400).json({
        message: "Claim ID is required",
      });
    }

    // Validate decision
    const allowedDecisions = ["approved", "rejected", "request_information"];
    if (!decision || !allowedDecisions.includes(decision)) {
      return res.status(400).json({
        message: "Invalid decision. Allowed values: approved, rejected, request_information",
      });
    }

    // Find claim by _id or claimNumber
    let claim;
    if (mongoose.Types.ObjectId.isValid(targetClaimId)) {
      claim = await Claim.findById(targetClaimId);
    }
    if (!claim) {
      claim = await Claim.findOne({ claimNumber: targetClaimId });
    }

    if (!claim) {
      if (!mongoose.Types.ObjectId.isValid(targetClaimId)) {
        return res.status(400).json({
          message: "Invalid claim ID",
        });
      }
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    // Validate approvedAmount
    let parsedApprovedAmount = 0;
    if (decision === "approved") {
      const amountToEvaluate = approvedAmount !== undefined ? approvedAmount : claim.claimedAmount;
      const numAmount = Number(amountToEvaluate);

      if (isNaN(numAmount) || numAmount < 0) {
        return res.status(400).json({
          message: "Approved amount must be greater than or equal to 0",
        });
      }

      if (numAmount > claim.claimedAmount) {
        return res.status(400).json({
          message: "Approved amount cannot exceed the claimed amount",
        });
      }

      parsedApprovedAmount = numAmount;
    } else if (approvedAmount !== undefined && approvedAmount !== null) {
      const numAmount = Number(approvedAmount);
      if (isNaN(numAmount) || numAmount < 0) {
        return res.status(400).json({
          message: "Approved amount must be greater than or equal to 0",
        });
      }

      if (numAmount > claim.claimedAmount) {
        return res.status(400).json({
          message: "Approved amount cannot exceed the claimed amount",
        });
      }
      parsedApprovedAmount = numAmount;
    }

    // Determine status transitions
    const previousStatus = claim.status;
    let newStatus;
    if (decision === "approved") {
      newStatus = "approved";
    } else if (decision === "rejected") {
      newStatus = "rejected";
    } else if (decision === "request_information") {
      newStatus = "documents_under_review";
    }

    claim.status = newStatus;
    await claim.save();

    const remarksText = remarks || comments || `Claim ${decision} by manager`;

    // Create ClaimHistory record
    const history = await ClaimHistory.create({
      claim: claim._id,
      previousStatus,
      newStatus,
      updatedBy: req.user.id,
      comments: remarksText,
    });

    // Create Approval record
    const approval = await Approval.create({
      claim: claim._id,
      manager: req.user.id,
      decision,
      approvedAmount: parsedApprovedAmount,
      comments: remarksText,
      remarks: remarksText,
      decisionDate: new Date(),
    });

    await approval.populate("claim");
    await approval.populate("manager", "name email role");

    res.status(200).json({
      message: `Claim ${decision === "request_information" ? "information requested" : decision} successfully`,
      claim,
      approval,
      history,
    });
  } catch (error) {
    console.error("Create approval error:", error);
    res.status(500).json({
      message: "Failed to record approval decision",
    });
  }
};

// Get all approval records (manager, admin, officer)
const getApprovals = async (req, res) => {
  try {
    const approvals = await Approval.find()
      .populate("claim")
      .populate("manager", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      approvals,
    });
  } catch (error) {
    console.error("Get approvals error:", error);
    res.status(500).json({
      message: "Failed to get approval records",
    });
  }
};

// Get single approval record by ID (manager, admin, officer)
const getApprovalById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Approval record not found",
      });
    }

    const approval = await Approval.findById(req.params.id)
      .populate("claim")
      .populate("manager", "name email role");

    if (!approval) {
      return res.status(404).json({
        message: "Approval record not found",
      });
    }

    res.status(200).json({
      approval,
    });
  } catch (error) {
    console.error("Get approval by ID error:", error);
    res.status(500).json({
      message: "Failed to get approval record",
    });
  }
};

module.exports = {
  createApproval,
  getApprovals,
  getApprovalById,
};
