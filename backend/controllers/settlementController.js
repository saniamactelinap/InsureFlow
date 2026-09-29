const mongoose = require("mongoose");
const Settlement = require("../models/Settlement");
const Claim = require("../models/Claim");
const Approval = require("../models/Approval");
const ClaimHistory = require("../models/ClaimHistory");

// Create settlement (officer, manager, admin)
const createSettlement = async (req, res) => {
  try {
    const {
      settlementAmount,
      paymentMethod,
      paymentReference,
      transactionId,
      remarks,
    } = req.body;

    const targetClaimId = req.body.claim || req.body.claimId;

    if (!targetClaimId) {
      return res.status(400).json({
        message: "Claim ID is required",
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

    // Check duplicate settlement
    const existingSettlement = await Settlement.findOne({
      claim: claim._id,
      status: { $ne: "failed" },
    });

    if (existingSettlement) {
      return res.status(400).json({
        message: "A settlement record already exists for this claim",
      });
    }

    // Claim must be in 'approved' status
    if (claim.status !== "approved") {
      return res.status(400).json({
        message: "Claim must be approved before settlement can be initiated",
      });
    }

    // Read the approved amount from relevant Approval record
    const approval = await Approval.findOne({
      claim: claim._id,
      decision: "approved",
    }).sort({ createdAt: -1 });

    if (!approval || approval.approvedAmount === undefined || approval.approvedAmount === null) {
      return res.status(400).json({
        message: "No approved decision found for this claim",
      });
    }

    const approvedAmount = approval.approvedAmount;

    // Validate settlementAmount
    const amountNum = Number(settlementAmount);
    if (settlementAmount === undefined || isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        message: "Settlement amount must be greater than 0",
      });
    }

    if (amountNum > approvedAmount) {
      return res.status(400).json({
        message: "Settlement amount cannot exceed the approved amount",
      });
    }

    const ref = paymentReference || transactionId || `SET-${Date.now()}`;

    const settlement = await Settlement.create({
      claim: claim._id,
      approvedAmount,
      settlementAmount: amountNum,
      paymentStatus: "processing",
      status: "processing",
      paymentMethod: paymentMethod || "Bank Transfer",
      paymentReference: ref,
      transactionId: ref,
      settlementDate: new Date(),
      paymentDate: new Date(),
      remarks,
      processedBy: req.user.id,
    });

    const previousStatus = claim.status;
    claim.status = "settlement_processing";
    await claim.save();

    await ClaimHistory.create({
      claim: claim._id,
      previousStatus,
      newStatus: "settlement_processing",
      updatedBy: req.user.id,
      comments: remarks || "Settlement processing initiated",
    });

    await settlement.populate("claim");
    await settlement.populate("processedBy", "name email role");

    res.status(201).json({
      message: "Settlement initiated successfully",
      settlement,
      claim,
    });
  } catch (error) {
    console.error("Create settlement error:", error);
    res.status(500).json({
      message: "Failed to create settlement",
    });
  }
};

// Get all settlements (officer, manager, admin)
const getSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find()
      .populate("claim")
      .populate("processedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      settlements,
    });
  } catch (error) {
    console.error("Get settlements error:", error);
    res.status(500).json({
      message: "Failed to get settlements",
    });
  }
};

// Get single settlement by ID (officer, manager, admin)
const getSettlementById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Settlement not found",
      });
    }

    const settlement = await Settlement.findById(req.params.id)
      .populate("claim")
      .populate("processedBy", "name email role");

    if (!settlement) {
      return res.status(404).json({
        message: "Settlement not found",
      });
    }

    res.status(200).json({
      settlement,
    });
  } catch (error) {
    console.error("Get settlement by ID error:", error);
    res.status(500).json({
      message: "Failed to get settlement",
    });
  }
};

// Update settlement status (officer, manager, admin)
const updateSettlementStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const allowedStatuses = ["processing", "completed", "failed"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Allowed values: processing, completed, failed",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Settlement not found",
      });
    }

    const settlement = await Settlement.findById(req.params.id);
    if (!settlement) {
      return res.status(404).json({
        message: "Settlement not found",
      });
    }

    settlement.status = status;
    settlement.paymentStatus = status;
    if (remarks) {
      settlement.remarks = remarks;
    }
    await settlement.save();

    const claim = await Claim.findById(settlement.claim);
    if (claim) {
      const previousStatus = claim.status;
      if (status === "completed") {
        claim.status = "settled";
        await claim.save();

        await ClaimHistory.create({
          claim: claim._id,
          previousStatus,
          newStatus: "settled",
          updatedBy: req.user.id,
          comments: remarks || "Settlement completed and claim settled",
        });
      } else if (status === "failed") {
        await ClaimHistory.create({
          claim: claim._id,
          previousStatus,
          newStatus: claim.status,
          updatedBy: req.user.id,
          comments: remarks || "Settlement payment failed",
        });
      }
    }

    await settlement.populate("claim");
    await settlement.populate("processedBy", "name email role");

    res.status(200).json({
      message: `Settlement status updated to ${status}`,
      settlement,
      claim,
    });
  } catch (error) {
    console.error("Update settlement status error:", error);
    res.status(500).json({
      message: "Failed to update settlement status",
    });
  }
};

// Close claim after settlement completion (manager, admin)
const closeSettlement = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Settlement not found",
      });
    }

    const settlement = await Settlement.findById(req.params.id);
    if (!settlement) {
      return res.status(404).json({
        message: "Settlement not found",
      });
    }

    if (settlement.status !== "completed" && settlement.paymentStatus !== "completed") {
      return res.status(400).json({
        message: "Only completed settlements can close a claim",
      });
    }

    const claim = await Claim.findById(settlement.claim);
    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    const previousStatus = claim.status;
    claim.status = "closed";
    await claim.save();

    await ClaimHistory.create({
      claim: claim._id,
      previousStatus,
      newStatus: "closed",
      updatedBy: req.user.id,
      comments: req.body.remarks || "Claim closed after settlement completion",
    });

    await settlement.populate("claim");
    await settlement.populate("processedBy", "name email role");

    res.status(200).json({
      message: "Claim closed successfully",
      settlement,
      claim,
    });
  } catch (error) {
    console.error("Close settlement error:", error);
    res.status(500).json({
      message: "Failed to close claim settlement",
    });
  }
};

module.exports = {
  createSettlement,
  getSettlements,
  getSettlementById,
  updateSettlementStatus,
  closeSettlement,
};
