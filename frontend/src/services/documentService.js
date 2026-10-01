import api from "./api";

export const getDocuments = async () => {
  const res = await api.get("/documents");
  const list = res.data?.documents || [];
  list.documents = list;
  return list;
};

export const uploadDocument = async (formData) => {
  const res = await api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getDocumentById = async (id) => {
  const res = await api.get(`/documents/${id}`);
  return res.data?.document || res.data;
};

export const verifyDocument = async (id, { verificationStatus, remarks }) => {
  const res = await api.put(`/documents/${id}/verify`, {
    verificationStatus,
    remarks,
  });
  return res.data;
};

export const documentService = {
  getDocuments,
  getDocumentById,
  uploadDocument,
  verifyDocument,
};

export default documentService;
