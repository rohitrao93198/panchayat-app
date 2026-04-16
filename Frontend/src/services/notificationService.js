import API from './api';

export const fetchNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.patch(`/notifications/${id}/read`);
export const fetchUnreadCount = () => API.get('/notifications/unread-count');
