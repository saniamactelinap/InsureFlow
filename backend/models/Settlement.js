const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema(
  {
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
    },
    approvedAmount: {
      type: Number,
      required: true,
    },
    settlementAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    paymentDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settlement", settlementSchema);
