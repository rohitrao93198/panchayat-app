import { useEffect, useMemo, useState } from "react";
import { getMyComplaints } from "../../services/complaintService";
import API from "../../services/api";

export default function MyComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});
    const [q, setQ] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const res = await getMyComplaints();
            setComplaints(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const qLower = q.trim().toLowerCase();
        return complaints.filter(item => {
            if (statusFilter && item.status !== statusFilter) return false;
            if (categoryFilter && (item.category || '').toLowerCase() !== categoryFilter.toLowerCase()) return false;
            if (!qLower) return true;
            const hay = `${item.translatedText || ''} ${item.originalText || ''} ${item.category || ''} ${item.priority || ''}`.toLowerCase();
            return hay.includes(qLower);
        });
    }, [complaints, q, statusFilter, categoryFilter]);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h1 className="text-2xl font-bold">My Complaints</h1>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">

                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search complaints"
                            className="px-3 py-2 border rounded w-full sm:w-56"
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-2 py-2 border rounded w-full sm:w-auto"
                        >
                            <option value="">All status</option>
                            <option value="pending">Pending</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        <input
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            placeholder="Category"
                            className="px-3 py-2 border rounded w-full sm:w-36"
                        />

                        <button
                            onClick={fetchComplaints}
                            className="px-3 py-2 bg-gray-100 rounded w-full sm:w-auto"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {loading && <div className="text-center text-gray-600">Loading...</div>}

            {!loading && filtered.length === 0 && (
                <div className="text-center text-gray-600">No complaints match your filters.</div>
            )}

            <div className="space-y-4">
                {!loading && filtered.map((c) => (
                    <div key={c._id} className="flex gap-4 p-4 bg-white rounded-lg shadow-sm items-start">
                        <div className={`w-2 rounded-full mt-1 ${(c.priority || '').toString().toLowerCase() === 'high' ? 'bg-red-500' : (c.priority || '').toString().toLowerCase() === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />

                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">{(c.translatedText || c.originalText || 'No title')}</h3>
                                    <div className="mt-1 text-sm text-gray-500">{c.category || 'Uncategorized'}</div>
                                </div>

                                <div className="text-right">
                                    <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</div>
                                    <div className="mt-2">
                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${c.status === 'resolved' ? 'bg-green-100 text-green-800' : c.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{c.status}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-3 text-gray-700">{c.translatedText || c.originalText}</p>

                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-sm font-medium ${(c.priority || '').toString().toLowerCase() === 'high' ? 'bg-red-100 text-red-700' : (c.priority || '').toString().toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                        }`}>{c.priority || 'N/A'}</span>
                                </div>

                                {c.audioUrl && (
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6a3 3 0 016 0v13" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10v2a7 7 0 0014 0v-2" />
                                        </svg>
                                        <audio controls className="h-8" src={`${getServerBase()}/${c.audioUrl.replaceAll('\\', '/').replace(/^\/+/, '')}`} />
                                    </div>
                                )}

                                {c.adminComment && (
                                    <div className="mt-1 text-sm text-gray-700 bg-gray-50 p-2 rounded">Admin: {c.adminComment}</div>
                                )}

                                <div className="ml-auto flex items-center gap-2">
                                    <button onClick={() => setExpanded(prev => ({ ...prev, [c._id]: !prev[c._id] }))} className="px-3 py-1 bg-gray-100 rounded text-sm">{expanded[c._id] ? 'Hide' : 'Details'}</button>
                                </div>
                            </div>

                            {expanded[c._id] && (
                                <div className="mt-3 text-sm text-gray-700 border-t pt-3 whitespace-pre-wrap">{c.originalText || c.translatedText}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function getServerBase() {
    const base = (API && API.defaults && API.defaults.baseURL) || '';
    return base.replace(/\/api\/?$/, '');
}
