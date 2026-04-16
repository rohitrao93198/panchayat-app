import { useState, useContext } from "react";
import { loginUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await loginUser(form);

            login(res.data);

            // 🔥 role based redirect
            if (res.data.user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/user/home");
            }

        } catch (err) {
            alert("Login failed");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="p-6 shadow-lg rounded-xl w-80">
                <h2 className="text-xl font-bold mb-4">Login</h2>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-2 p-2 border"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-2 p-2 border"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />

                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    Login
                </button>
                <div className="text-center mt-3">
                    <Link to="/register" className="text-sm text-indigo-600 underline">New user? Register</Link>
                </div>
            </div>
        </div>
    );
}