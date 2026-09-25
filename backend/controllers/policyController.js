const mongoose = require("mongoose");
const Policy = require("../models/Policy");
const User = require("../models/User");

// @route POST /api/policies  (admin only)
const createPolicy = async (req, res) => {
  try {
    const {
      policyNumber,
      customer,
      policyType,
      premiumAmount,
      coverageAmount,
      startDate,
      endDate,
      status,
    } = req.body;

    if (
      !policyNumber ||
      !customer ||
      !policyType ||
      premiumAmount === undefined ||
      coverageAmount === undefined ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message:
          "policyNumber, customer, policyType, premiumAmount, coverageAmount, startDate and endDate are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(customer)) {
      return res.status(400).json({ message: "customer must be a valid user id" });
    }

    const customerExists = await User.findById(customer);
    if (!customerExists) {
      return res.status(404).json({ message: "Referenced customer does not exist" });
    }

    if (premiumAmount <= 0 || coverageAmount <= 0) {
      return res.status(400).json({ message: "premiumAmount and coverageAmount must be positive numbers" });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "startDate must be before endDate" });
    }

    const existingPolicy = await Policy.findOne({ policyNumber });
    if (existingPolicy) {
      return res.status(400).json({ message: "policyNumber already exists" });
    }

    const policy = await Policy.create({
      policyNumber,
      customer,
      policyType,
      premiumAmount,
      coverageAmount,
      startDate,
      endDate,
      status: status || "active",
    });

    return res.status(201).json({ message: "Policy created successfully", policy });
  } catch (error) {
    console.error("Create policy error:", error.message);
    return res.status(500).json({ message: "Something went wrong while creating the policy" });
  }
};

// @route GET /api/policies
const getPolicies = async (req, res) => {
  try {
    let filter = {};

    // Customers only ever see their own policies
    if (req.user.role === "customer") {
      filter.customer = req.user.id;
    }

    const policies = await Policy.find(filter)
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({ policies });
  } catch (error) {
    console.error("Get policies error:", error.message);
    return res.status(500).json({ message: "Something went wrong while fetching policies" });
  }
};

// @route GET /api/policies/:id
const getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid policy id" });
    }

    const policy = await Policy.findById(id).populate("customer", "name email phone");

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    // A customer may only view their own policy
    if (req.user.role === "customer" && policy.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "You do not have access to this policy" });
    }

    return res.status(200).json({ policy });
  } catch (error) {
    console.error("Get policy error:", error.message);
    return res.status(500).json({ message: "Something went wrong while fetching the policy" });
  }
};

// @route PUT /api/policies/:id  (admin only)
const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid policy id" });
    }

    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    // Only these fields may be updated; policyNumber and customer are protected
    const allowedUpdates = [
      "policyType",
      "premiumAmount",
      "coverageAmount",
      "startDate",
      "endDate",
      "status",
    ];

    const updates = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.premiumAmount !== undefined && updates.premiumAmount <= 0) {
      return res.status(400).json({ message: "premiumAmount must be a positive number" });
    }

    if (updates.coverageAmount !== undefined && updates.coverageAmount <= 0) {
      return res.status(400).json({ message: "coverageAmount must be a positive number" });
    }

    const newStart = updates.startDate || policy.startDate;
    const newEnd = updates.endDate || policy.endDate;
    if (new Date(newStart) >= new Date(newEnd)) {
      return res.status(400).json({ message: "startDate must be before endDate" });
    }

    if (updates.status && !["active", "expired", "cancelled"].includes(updates.status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    Object.assign(policy, updates);
    await policy.save();

    return res.status(200).json({ message: "Policy updated successfully", policy });
  } catch (error) {
    console.error("Update policy error:", error.message);
    return res.status(500).json({ message: "Something went wrong while updating the policy" });
  }
};

// @route DELETE /api/policies/:id  (admin only)
const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid policy id" });
    }

    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    await policy.deleteOne();

    return res.status(200).json({ message: "Policy deleted successfully" });
  } catch (error) {
    console.error("Delete policy error:", error.message);
    return res.status(500).json({ message: "Something went wrong while deleting the policy" });
  }
};

module.exports = {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
};
