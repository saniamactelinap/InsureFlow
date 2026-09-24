const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema(
  {
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    decision: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    comments: {
      type: String,
    },
    approvedAmount: {
      type: Number,
    },
    decisionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Approval", approvalSchema);
