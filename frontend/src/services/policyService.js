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

export const policyService = {
  getPolicies,
  getPolicyById,
};

export default policyService;
