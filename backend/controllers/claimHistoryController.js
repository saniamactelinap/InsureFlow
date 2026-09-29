const mongoose = require("mongoose");
const Claim = require("../models/Claim");
const ClaimHistory = require("../models/ClaimHistory");

// @desc    Get history for a specific claim
// @route   GET /api/claims/:id/history
// @access  Private (customer, officer, surveyor, manager, admin)
const getClaimHistory = async (req, res) => {
  try {
    const claimIdentifier = req.params.id;

    if (!claimIdentifier) {
      return res.status(400).json({
        message: "Claim ID is required",
      });
    }

    let claim;
    if (mongoose.Types.ObjectId.isValid(claimIdentifier)) {
      claim = await Claim.findById(claimIdentifier);
    }
    if (!claim) {
      claim = await Claim.findOne({ claimNumber: claimIdentifier });
    }

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    // Customer can only view history for their own claims
    if (
      req.user.role === "customer" &&
      claim.customer.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        message: "You can only view history for your own claims",
      });
    }

    // Query claim history, sorted newest to oldest
    const history = await ClaimHistory.find({ claim: claim._id })
      .populate("updatedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Error fetching claim history:", error);
    res.status(500).json({
      message: "Failed to fetch claim history",
    });
  }
};

module.exports = {
  getClaimHistory,
};
