import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../utils/mail.js";

// Register a new user
export const register = async (req, res) => {
    try {
        const { name, email, password, role, flatNumber } = req.body;
        if (!name || !email || !password || !flatNumber) {
            return res.status(400).json({ message: "Name, email, password and flatNumber are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            flatNumber,
        });

        // send welcome email asynchronously (do not block response)
        sendWelcomeEmail(user).catch((err) => console.error("sendWelcomeEmail error", err));

        // avoid sending password back
        const userSafe = user.toObject ? user.toObject() : user;
        if (userSafe.password) delete userSafe.password;

        res.status(201).json({ message: "User registered successfully", user: userSafe });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({ message: "Login successful", token, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}