import { useEffect, useState } from "react";
import API from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function Users() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await API.get("/admin/users");
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <div className="p-6 flex-1 md:ml-64">
                <h1 className="text-2xl font-bold mb-4">Users 👥</h1>

                {/* Mobile: stacked user cards */}
                <div className="md:hidden space-y-3">
                    {users.map(u => (
                        <div key={u._id} className="p-4 bg-white shadow rounded">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-semibold">{u.name}</div>
                                    <div className="text-sm text-gray-600">{u.email}</div>
                                    <div className="text-sm">Flat: {u.flatNumber}</div>
                                </div>
                                <div className="text-sm text-gray-500">{u.role}</div>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
                        </div>
                    ))}
                </div>

                {/* Desktop / tablet: table */}
                <div className="hidden md:block bg-white shadow rounded-lg p-4 overflow-auto">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="text-left">
                                <th className="px-2 py-2">Name</th>
                                <th className="px-2 py-2">Email</th>
                                <th className="px-2 py-2">Flat</th>
                                <th className="px-2 py-2">Role</th>
                                <th className="px-2 py-2">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id} className="border-t">
                                    <td className="px-2 py-3">{u.name}</td>
                                    <td className="px-2 py-3">{u.email}</td>
                                    <td className="px-2 py-3">{u.flatNumber}</td>
                                    <td className="px-2 py-3">{u.role}</td>
                                    <td className="px-2 py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
