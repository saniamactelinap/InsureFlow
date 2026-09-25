const Claim = require("../models/Claim");
const Policy = require("../models/Policy");

// Create a new claim
const createClaim = async (req, res) => {
  try {
    const {
      claimNumber,
      policy,
      claimType,
      incidentDate,
      description,
      claimedAmount,
    } = req.body;

    // Check required fields
    if (
      !claimNumber ||
      !policy ||
      !claimType ||
      !incidentDate ||
      !description ||
      claimedAmount === undefined
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // Check claimed amount
    if (claimedAmount <= 0) {
      return res.status(400).json({
        message: "Claimed amount must be greater than 0",
      });
    }

    // Check policy
    const existingPolicy = await Policy.findById(policy);

    if (!existingPolicy) {
      return res.status(404).json({
        message: "Policy not found",
      });
    }

    // Customer can only claim against their own policy
    if (existingPolicy.customer.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only create claims for your own policy",
      });
    }

    // Check duplicate claim number
    const existingClaim = await Claim.findOne({ claimNumber });

    if (existingClaim) {
      return res.status(400).json({
        message: "Claim number already exists",
      });
    }

    // Create claim
    const claim = await Claim.create({
      claimNumber,
      customer: req.user.id,
      policy,
      claimType,
      incidentDate,
      description,
      claimedAmount,
    });

    res.status(201).json({
      message: "Claim created successfully",
      claim,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create claim",
    });
  }
};

// Get claims
const getClaims = async (req, res) => {
  try {
    let claims;

    if (req.user.role === "customer") {
      claims = await Claim.find({
        customer: req.user.id,
      })
        .populate("policy")
        .populate("customer", "name email");
    } else {
      claims = await Claim.find()
        .populate("policy")
        .populate("customer", "name email");
    }

    res.status(200).json({
      claims,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get claims",
    });
  }
};

// Get one claim
const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate("policy")
      .populate("customer", "name email");

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
      });
    }

    // Customer can only view their own claim
    if (
      req.user.role === "customer" &&
      claim.customer._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only view your own claims",
      });
    }

    res.status(200).json({
      claim,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get claim",
    });
  }
};

module.exports = {
  createClaim,
  getClaims,
  getClaimById,
};