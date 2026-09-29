const mongoose = require("mongoose");
const SurveyReport = require("../models/SurveyReport");
const Claim = require("../models/Claim");
const User = require("../models/User");
const ClaimHistory = require("../models/ClaimHistory");
const { createNotification } = require("../services/notificationService");

// Assign a surveyor to a claim (officer, manager, admin)
const assignSurveyor = async (req, res) => {
  try {
    const { surveyorId, surveyor: altSurveyorId } = req.body;
    const targetSurveyorId = surveyorId || altSurveyorId;

    if (!targetSurveyorId) {
      return res.status(400).json({
        message: "surveyorId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetSurveyorId)) {
      return res.status(400).json({
        message: "Invalid surveyor ID",
      });
    }

    // Verify surveyor user exists and has the surveyor role
    const surveyorUser = await User.findById(targetSurveyorId);
    if (!surveyorUser) {
      return res.status(404).json({
        message: "Surveyor not found",
      });
    }

    if (surveyorUser.role !== "surveyor") {
      return res.status(400).json({
        message: "Selected user is not a surveyor",
      });
    }

    // Find claim by _id or claimNumber
    let claim;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      claim = await Claim.findById(req.params.id);
    }
    if (!claim) {
      claim = await Claim.findOne({ claimNumber: req.params.id });
    }

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    const previousStatus = claim.status;

    // Assign surveyor
    claim.assignedSurveyor = surveyorUser._id;
    if (claim.status === "submitted" || claim.status === "documents_verified") {
      claim.status = "under_investigation";
    }

    await claim.save();

    // Create ClaimHistory if status changed
    if (previousStatus !== claim.status) {
      await ClaimHistory.create({
        claim: claim._id,
        previousStatus,
        newStatus: claim.status,
        updatedBy: req.user.id,
        comments: `Surveyor assigned to investigate claim`,
      });
    }

    // Notify assigned surveyor
    await createNotification({
      user: surveyorUser._id,
      title: "Survey Assigned",
      message: `You have been assigned to survey claim ${claim.claimNumber}.`,
      type: "survey",
      claim: claim._id,
    });

    // Notify customer
    const customerId = claim.customer?._id || claim.customer;
    if (customerId) {
      await createNotification({
        user: customerId,
        title: "Claim Under Investigation",
        message: `A surveyor has been assigned to investigate your claim ${claim.claimNumber}.`,
        type: "claim",
        claim: claim._id,
      });
    }

    await claim.populate("assignedSurveyor", "name email phone role");
    await claim.populate("customer", "name email phone");
    await claim.populate("policy");

    res.status(200).json({
      message: "Surveyor assigned successfully",
      claim,
    });
  } catch (error) {
    console.error("Assign surveyor error:", error);
    res.status(500).json({
      message: "Failed to assign surveyor",
    });
  }
};

// Get claims assigned to the logged-in surveyor
const getAssignedClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ assignedSurveyor: req.user.id })
      .populate("customer", "name email phone")
      .populate("policy")
      .populate("assignedOfficer", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      claims,
    });
  } catch (error) {
    console.error("Get assigned claims error:", error);
    res.status(500).json({
      message: "Failed to get assigned claims",
    });
  }
};

// Create a survey report (surveyor only)
const createSurveyReport = async (req, res) => {
  try {
    const {
      inspectionDate,
      findings,
      damageDescription,
      estimatedLoss,
      recommendation,
      remarks,
      images,
    } = req.body;

    const claimId = req.body.claim || req.body.claimId;

    // Check required fields
    if (!claimId || !inspectionDate || !findings || estimatedLoss === undefined) {
      return res.status(400).json({
        message: "claim, inspectionDate, findings, and estimatedLoss are required",
      });
    }

    const lossNum = Number(estimatedLoss);
    if (isNaN(lossNum) || lossNum < 0) {
      return res.status(400).json({
        message: "Estimated loss must be a non-negative number",
      });
    }

    // Find claim
    let claim;
    if (mongoose.Types.ObjectId.isValid(claimId)) {
      claim = await Claim.findById(claimId);
    }
    if (!claim) {
      claim = await Claim.findOne({ claimNumber: claimId });
    }

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    // Verify that the logged-in surveyor is assigned to this claim
    if (
      !claim.assignedSurveyor ||
      claim.assignedSurveyor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only create survey reports for claims assigned to you",
      });
    }

    const report = await SurveyReport.create({
      claim: claim._id,
      surveyor: req.user.id,
      inspectionDate,
      findings,
      damageDescription,
      estimatedLoss: lossNum,
      recommendation,
      remarks,
      images: images || [],
      reportStatus: "completed",
    });

    await report.populate("claim");
    await report.populate("surveyor", "name email phone");

    // Notify customer about survey report completion
    if (claim.customer) {
      const custId = claim.customer._id || claim.customer;
      await createNotification({
        user: custId,
        title: "Survey Completed",
        message: `The survey report for your claim ${claim.claimNumber} has been completed.`,
        type: "survey",
        claim: claim._id,
      });
    }

    res.status(201).json({
      message: "Survey report created successfully",
      report,
    });
  } catch (error) {
    console.error("Create survey report error:", error);
    res.status(500).json({
      message: "Failed to create survey report",
    });
  }
};

// Get survey reports
const getSurveyReports = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "surveyor") {
      filter = { surveyor: req.user.id };
    } else if (req.user.role === "customer") {
      return res.status(403).json({
        message: "You do not have permission to view survey reports",
      });
    }

    const reports = await SurveyReport.find(filter)
      .populate("claim")
      .populate("surveyor", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      reports,
    });
  } catch (error) {
    console.error("Get survey reports error:", error);
    res.status(500).json({
      message: "Failed to get survey reports",
    });
  }
};

// Get single survey report by ID
const getSurveyReportById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Survey report not found",
      });
    }

    const report = await SurveyReport.findById(req.params.id)
      .populate("claim")
      .populate("surveyor", "name email phone");

    if (!report) {
      return res.status(404).json({
        message: "Survey report not found",
      });
    }

    // Customer cannot view survey reports directly
    if (req.user.role === "customer") {
      return res.status(403).json({
        message: "You do not have permission to view survey reports",
      });
    }

    // Surveyor can only view reports for their assigned claims
    if (
      req.user.role === "surveyor" &&
      report.surveyor &&
      report.surveyor._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only view reports for your assigned claims",
      });
    }

    res.status(200).json({
      report,
    });
  } catch (error) {
    console.error("Get survey report by ID error:", error);
    res.status(500).json({
      message: "Failed to get survey report",
    });
  }
};

// Review survey report (officer, manager, admin)
const reviewSurveyReport = async (req, res) => {
  try {
    const { reportStatus, remarks } = req.body;

    const allowedStatuses = ["pending", "completed", "reviewed"];
    if (!reportStatus || !allowedStatuses.includes(reportStatus)) {
      return res.status(400).json({
        message: "Invalid report status. Allowed values: pending, completed, reviewed",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        message: "Survey report not found",
      });
    }

    const report = await SurveyReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Survey report not found",
      });
    }

    report.reportStatus = reportStatus;
    if (remarks !== undefined) {
      report.remarks = remarks;
    }

    await report.save();

    await report.populate("claim");
    await report.populate("surveyor", "name email phone");

    res.status(200).json({
      message: "Survey report reviewed successfully",
      report,
    });
  } catch (error) {
    console.error("Review survey report error:", error);
    res.status(500).json({
      message: "Failed to review survey report",
    });
  }
};

module.exports = {
  assignSurveyor,
  getAssignedClaims,
  createSurveyReport,
  getSurveyReports,
  getSurveyReportById,
  reviewSurveyReport,
};
