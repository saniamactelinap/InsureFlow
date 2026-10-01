import api from "./api";

export const getSettlements = async () => {
  const res = await api.get("/settlements");
  return res.data?.settlements || [];
};

export const getSettlementById = async (id) => {
  const res = await api.get(`/settlements/${id}`);
  return res.data?.settlement || res.data;
};

export const createSettlement = async (settlementData) => {
  const res = await api.post("/settlements", settlementData);
  return res.data;
};

export const updateSettlementStatus = async (id, statusData) => {
  const res = await api.put(`/settlements/${id}/status`, statusData);
  return res.data;
};

export const closeSettlement = async (id, closeData = {}) => {
  const res = await api.put(`/settlements/${id}/close`, closeData);
  return res.data;
};

export const settlementService = {
  getSettlements,
  getSettlementById,
  createSettlement,
  updateSettlementStatus,
  closeSettlement,
};

export default settlementService;
