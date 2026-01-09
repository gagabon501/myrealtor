import client from "./client";

export const getBuyerApplicationMessages = (id) => client.get(`/applications/${id}/messages`);
export const sendBuyerApplicationMessage = (id, body) =>
  client.post(`/applications/${id}/messages`, { body });

export const getAdminApplicationMessages = (id) =>
  client.get(`/applications/admin/${id}/messages`);
export const sendAdminApplicationMessage = (id, { body, isInternal }) =>
  client.post(`/applications/admin/${id}/messages`, { body, isInternal });


