import API from "./api";

// ➕ Create complaint
export const createComplaint = (data) =>
    // Let the browser set the Content-Type (including boundary) for FormData
    API.post("/complaints", data);

// 📋 Get my complaints
export const getMyComplaints = () => API.get("/complaints/my");