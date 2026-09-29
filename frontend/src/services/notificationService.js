import api from "./api";

export const getNotifications = async () => {
  const res = await api.get("/notifications");
  const list = res.data?.data || [];
  list.data = list;
  return list;
};

export const markAsRead = async (id) => {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data?.data;
};

export const markAllAsRead = async () => {
  const res = await api.put("/notifications/read-all");
  return res.data;
};

export const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

export default notificationService;
