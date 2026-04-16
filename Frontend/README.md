import { useEffect, useState } from "react";
import API from "../../services/api";
import Sidebar from "../../components/Sidebar";

import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend,
ArcElement,
PointElement,
LineElement
} from "chart.js";

import { Bar, Pie, Line } from "react-chartjs-2";
import { FiUsers, FiFileText, FiCheckCircle, FiClock } from "react-icons/fi";

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend,
ArcElement,
PointElement,
LineElement
);

export default function Dashboard() {
const [stats, setStats] = useState({});
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

    useEffect(() => {
        fetchStats();
    }, [startDate, endDate]);

    const fetchStats = async () => {
        const res = await API.get("/admin/dashboard", {
            params: { startDate, endDate }
        });
        setStats(res.data);
    };

    const applyPreset = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (days - 1));
        setStartDate(start.toISOString().slice(0, 10));
        setEndDate(end.toISOString().slice(0, 10));
    };

    const applyThisMonth = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        setStartDate(start.toISOString().slice(0, 10));
        setEndDate(now.toISOString().slice(0, 10));
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            <Sidebar />

            <div className="flex-1 overflow-y-auto p-6 md:ml-64">

                {/* HEADER */}
                <h1 className="text-3xl font-bold mb-6">📊 Admin Dashboard</h1>

                {/* FILTERS */}
                <div className="bg-white p-4 rounded-2xl shadow mb-6 flex flex-wrap gap-4 items-end">
                    <button onClick={() => applyPreset(7)} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Last 7 days</button>
                    <button onClick={() => applyPreset(30)} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Last 30 days</button>
                    <button onClick={applyThisMonth} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">This month</button>

                    <div>
                        <label className="text-sm">Start</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 border rounded" />
                    </div>

                    <div>
                        <label className="text-sm">End</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 border rounded" />
                    </div>

                    <button
                        onClick={() => { setStartDate(""); setEndDate(""); }}
                        className="ml-auto px-3 py-1 bg-gray-200 rounded"
                    >
                        Clear
                    </button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <Card title="Complaints" value={stats.totalComplaints} icon={<FiFileText />} />
                    <Card title="Resolved %" value={`${stats.resolvedPercent || 0}%`} icon={<FiCheckCircle />} />
                    <Card title="Pending %" value={`${stats.pendingPercent || 0}%`} icon={<FiClock />} />
                    <Card title="Bookings" value={stats.totalBookings} icon={<FiFileText />} />
                    <Card title="Users" value={stats.totalUsers} icon={<FiUsers />} />
                </div>

                {/* CHARTS */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

                    {/* BIG LINE CHART */}
                    <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow">
                        <h3 className="text-lg font-semibold mb-3">Monthly Complaints</h3>
                        <Line
                            data={{
                                labels: (stats.monthlySeries || []).map(m => `${m.month}/${m.year}`),
                                datasets: [{
                                    label: "Complaints",
                                    data: (stats.monthlySeries || []).map(m => m.count),
                                    borderColor: "#6366f1",
                                    backgroundColor: "rgba(99,102,241,0.2)",
                                    tension: 0.4
                                }]
                            }}
                        />
                    </div>

                    {/* SERVICE USAGE */}
                    <div className="bg-white p-5 rounded-2xl shadow">
                        <h3 className="text-lg font-semibold mb-3">Service Usage</h3>
                        <Bar
                            data={{
                                labels: (stats.serviceUsage || []).map(s => s.name),
                                datasets: [{
                                    data: (stats.serviceUsage || []).map(s => s.count),
                                    backgroundColor: "#6366f1"
                                }]
                            }}
                            options={{
                                plugins: { legend: { display: false } }
                            }}
                        />
                    </div>

                    {/* PIE */}
                    <div className="bg-white p-5 rounded-2xl shadow">
                        <h3 className="text-lg font-semibold mb-3">Complaint Categories</h3>
                        <Pie
                            data={{
                                labels: (stats.categoryBreakdown || []).map(c => c.category),
                                datasets: [{
                                    data: (stats.categoryBreakdown || []).map(c => c.count),
                                    backgroundColor: [
                                        "#6366f1",
                                        "#22c55e",
                                        "#f59e0b",
                                        "#ef4444",
                                        "#3b82f6"
                                    ]
                                }]
                            }}
                        />
                    </div>

                </div>
            </div>
        </div>
    );

}

/_ CARD COMPONENT _/
function Card({ title, value, icon }) {
return (
<div className="p-4 rounded-2xl bg-white shadow-md hover:shadow-xl transition flex items-center justify-between">
<div>
<p className="text-sm text-gray-500">{title}</p>
<h2 className="text-2xl font-bold">{value || 0}</h2>
</div>
<div className="text-indigo-500 text-2xl">
{icon}
</div>
</div>
);
}
