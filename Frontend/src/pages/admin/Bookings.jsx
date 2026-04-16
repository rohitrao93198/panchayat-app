import { useEffect, useState } from "react";
import API from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function Bookings() {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await API.get("/bookings");
        setData(res.data);
    };

    const updateStatus = async (id, status) => {
        await API.patch(`/bookings/${id}`, { status });
        fetchData();
    };

    return (
        <div className="flex">
            <Sidebar />

            <div className="p-6 flex-1 md:ml-64">
                <h1 className="text-2xl font-bold mb-4">Bookings 📅</h1>

                <div className="space-y-4">
                    {data.map((b) => (
                        <div key={b._id} className="p-4 shadow rounded bg-white w-full">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold">{b.service?.name || 'Service'}</h2>
                                    <p className="text-sm text-gray-600">{b.date} - {b.time}</p>
                                    <p className="text-sm mt-2">Status: <strong>{b.status}</strong></p>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm">User: <strong>{b.user?.name || b.user?.email || '—'}</strong></p>
                                    <p className="text-sm">Flat: <strong>{b.user?.flatNumber || '—'}</strong></p>
                                    <div className="mt-3 flex gap-2 justify-end">
                                        <button
                                            onClick={() => updateStatus(b._id, "approved")}
                                            disabled={b.status !== 'pending'}
                                            className={`px-2 py-1 rounded ${b.status === 'pending' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => updateStatus(b._id, "rejected")}
                                            disabled={b.status !== 'pending'}
                                            className={`px-2 py-1 rounded ${b.status === 'pending' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}