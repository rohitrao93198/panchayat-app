import API from "./api";

export const sendMessage = (message) =>
    // backend expects `{ question }` in the request body
    API.post("/chat", { question: message });