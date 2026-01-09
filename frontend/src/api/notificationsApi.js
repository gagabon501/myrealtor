import client from "./client";

export const fetchNotifications = () => client.get("/notifications");
export const fetchUnreadCount = () => client.get("/notifications/unread-count");
export const markNotificationRead = (id) => client.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => client.patch("/notifications/read-all");


