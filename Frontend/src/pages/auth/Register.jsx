import { useState } from "react";
import { registerUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "", flatNumber: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await registerUser(form);
            toast.success(res.data?.message || "Registered");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white rounded shadow">
                <h1 className="text-2xl font-bold mb-4">Register</h1>

                <input className="w-full mb-3 p-2 border rounded" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input className="w-full mb-3 p-2 border rounded" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <input type="password" className="w-full mb-3 p-2 border rounded" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <input className="w-full mb-3 p-2 border rounded" placeholder="Flat Number" value={form.flatNumber} onChange={e => setForm({ ...form, flatNumber: e.target.value })} />

                <button className="w-full bg-indigo-600 text-white p-2 rounded" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
            </form>
        </div>
    );
}