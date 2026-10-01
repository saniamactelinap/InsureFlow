import api from "./api";

export const getPolicies = async () => {
  const res = await api.get("/policies");
  const list = res.data?.policies || [];
  list.policies = list;
  return list;
};

export const getPolicyById = async (id) => {
  const res = await api.get(`/policies/${id}`);
  const policy = res.data?.policy || res.data;
  return policy;
};

export const createPolicy = async (policyData) => {
  const res = await api.post("/policies", policyData);
  return res.data?.policy || res.data;
};

export const updatePolicy = async (id, policyData) => {
  const res = await api.put(`/policies/${id}`, policyData);
  return res.data?.policy || res.data;
};

export const deletePolicy = async (id) => {
  const res = await api.delete(`/policies/${id}`);
  return res.data;
};

export const policyService = {
  getPolicies,
  getPolicyById,
  createPolicy,
  updatePolicy,
  deletePolicy,
};

export default policyService;
