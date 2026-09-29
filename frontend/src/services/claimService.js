import api from "./api";

export const getClaims = async () => {
  const res = await api.get("/claims");
  const list = res.data?.claims || [];
  list.claims = list;
  return list;
};

export const getClaimById = async (id) => {
  const res = await api.get(`/claims/${id}`);
  const claim = res.data?.claim || res.data;
  return { claim };
};

export const createClaim = async (claimData) => {
  const res = await api.post("/claims", claimData);
  return res.data;
};

export const getClaimHistory = async (id) => {
  const res = await api.get(`/claims/${id}/history`);
  const list = res.data?.history || [];
  list.history = list;
  return list;
};

export const claimService = {
  getClaims,
  getClaimById,
  createClaim,
  getClaimHistory,
};

export default claimService;
