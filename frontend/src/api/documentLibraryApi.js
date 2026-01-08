import client from "./client";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const listDocuments = async ({ module, ownerId }) => {
  return client.get("/document-library", {
    params: { module, ownerId },
    headers: authHeaders(),
  });
};

export const uploadDocuments = async (formData) => {
  return client.post("/document-library", formData, {
    headers: { "Content-Type": "multipart/form-data", ...authHeaders() },
  });
};

export const deleteDocument = async (id) => {
  return client.delete(`/document-library/${id}`, {
    headers: authHeaders(),
  });
};


