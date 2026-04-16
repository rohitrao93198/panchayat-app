import { useState, useEffect } from "react";
import API from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function Announcement() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [history, setHistory] = useState([]);

    const loadHistory = async () => {
        const res = await API.get('/admin/announcements');
        setHistory(res.data || []);
    };

    useEffect(() => { loadHistory(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");
        try {
            await API.post("/admin/announce", { title, message, scheduledAt });
            setSuccess("Announcement posted");
            setTitle("");
            setMessage("");
            setScheduledAt("");
            await loadHistory();
        } catch (err) {
            console.error(err);
            setSuccess("Failed to post announcement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex">
            {/* fixed sidebar on larger screens */}
            <div className="hidden md:block">
                <div className="fixed left-0 top-0 w-64 h-screen">
                    <Sidebar />
                </div>
            </div>

            {/* main content - offset on md to account for fixed sidebar; full viewport height */}
            <div className="flex-1 flex justify-center md:ml-64">
                <div className="w-full max-w-3xl p-6 flex flex-col h-screen">
                    <h1 className="text-2xl font-bold mb-4 text-center">Post Announcement 📢</h1>

                    <form onSubmit={submit} className="w-full">
                        <label className="block mb-2">Title</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded mb-4" />

                        <label className="block mb-2">Message</label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="w-full p-2 border rounded mb-4" />

                        <label className="block mb-2">Schedule (optional)</label>
                        <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full p-2 border rounded mb-4" />

                        <button disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
                            {loading ? 'Posting...' : 'Post Announcement'}
                        </button>

                        {success && <div className="mt-4">{success}</div>}
                    </form>

                    <div className="mt-8 flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold mb-2">Announcement History</h3>
                        <div className="space-y-3 overflow-auto pr-2 flex-1">
                            {history.map(a => (
                                <div key={a._id} className="p-3 bg-white shadow rounded flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                    <div>
                                        <div className="font-semibold">{a.title} {a.published ? <span className="text-sm text-green-600">(published)</span> : <span className="text-sm text-yellow-600">(scheduled)</span>}</div>
                                        <div className="text-sm text-gray-600 mt-1">{a.message}</div>
                                        <div className="text-xs text-gray-400 mt-1">Created: {new Date(a.createdAt).toLocaleString()}{a.scheduledAt && <span> • Scheduled: {new Date(a.scheduledAt).toLocaleString()}</span>}</div>
                                    </div>
                                    <div className="flex gap-2 md:ml-4">
                                        {!a.published && <button onClick={async () => { await API.post(`/admin/announcements/${a._id}/publish`); await loadHistory(); }} className="px-3 py-1 bg-indigo-600 text-white rounded">Publish</button>}
                                        {/* <button onClick={async () => { await API.delete(`/admin/announcements/${a._id}`); await loadHistory(); }} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button> */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
