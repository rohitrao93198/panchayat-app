import API from "./api";

// 🔹 Get all services
export const getServices = () => API.get("/services");

// 🔹 Book service
export const createBooking = (data) => API.post("/bookings", data);

// 🔹 Get my bookings
export const getMyBookings = () => API.get("/bookings/my");