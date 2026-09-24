const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    claimNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },
    claimType: {
      type: String,
      required: true,
    },
    incidentDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    claimedAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "submitted",
        "documents_under_review",
        "documents_verified",
        "under_investigation",
        "pending_approval",
        "approved",
        "rejected",
        "settlement_processing",
        "settled",
        "closed",
      ],
      default: "submitted",
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedSurveyor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Claim", claimSchema);
