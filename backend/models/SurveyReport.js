const mongoose = require("mongoose");

const surveyReportSchema = new mongoose.Schema(
  {
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: true,
    },
    surveyor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inspectionDate: {
      type: Date,
      required: true,
    },
    findings: {
      type: String,
      required: true,
    },
    damageDescription: {
      type: String,
    },
    estimatedLoss: {
      type: Number,
      required: true,
    },
    recommendation: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SurveyReport", surveyReportSchema);
