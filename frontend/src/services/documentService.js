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

export const documentService = {
  getDocuments,
  uploadDocument,
};

export default documentService;
