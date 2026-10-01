import api from "./api";

export const getApprovals = async () => {
  const res = await api.get("/approvals");
  return res.data?.approvals || [];
};

export const getApprovalById = async (id) => {
  const res = await api.get(`/approvals/${id}`);
  return res.data?.approval || res.data;
};

export const createApproval = async (claimId, approvalData) => {
  const res = await api.put(`/claims/${claimId}/approval`, approvalData);
  return res.data;
};

export const approvalService = {
  getApprovals,
  getApprovalById,
  createApproval,
};

export default approvalService;
