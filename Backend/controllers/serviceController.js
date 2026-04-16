import Service from "../models/Service.js";

// ➕ Add Service (Admin)
export const addService = async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📋 Get All Services
export const getServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};