import api from "./api";

export const getAssignedClaims = async () => {
  const res = await api.get("/surveys/assigned");
  return res.data?.claims || [];
};

export const getSurveyReports = async () => {
  const res = await api.get("/surveys");
  return res.data?.reports || [];
};

export const getSurveyReportById = async (id) => {
  const res = await api.get(`/surveys/${id}`);
  return res.data?.report || res.data;
};

export const createSurveyReport = async (reportData) => {
  const res = await api.post("/surveys", reportData);
  return res.data;
};

export const reviewSurveyReport = async (id, reviewData) => {
  const res = await api.put(`/surveys/${id}/review`, reviewData);
  return res.data;
};

export const surveyService = {
  getAssignedClaims,
  getSurveyReports,
  getSurveyReportById,
  createSurveyReport,
  reviewSurveyReport,
};

export default surveyService;
