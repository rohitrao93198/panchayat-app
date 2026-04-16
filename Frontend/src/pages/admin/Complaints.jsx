import { useEffect, useState } from "react";
import API from "../../services/api";
import Sidebar from "../../components/Sidebar";

export default function Complaints() {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await API.get("/complaints");
        setData(res.data);
    };

    const updateStatus = async (id, status) => {
        await API.patch(`/complaints/${id}`, { status });
        fetchData();
    };

    const serverBase = (API && API.defaults && API.defaults.baseURL) ? API.defaults.baseURL.replace(/\/api\/?$/, '') : '';

    const makeAudioSrc = (audioPath) => {
        if (!audioPath) return '';
        if (/^https?:\/\//.test(audioPath)) return audioPath;
        const cleaned = audioPath.replaceAll('\\', '/').replace(/^\/+/, '');
        const base = serverBase || (typeof window !== 'undefined' ? window.location.origin : '');
        return `${base}/${cleaned}`;
    };

    return (
        <div className="flex">
            <Sidebar />

            <div className="p-6 flex-1 md:ml-64">
                <h1 className="text-2xl font-bold mb-4">Complaints 📢</h1>

                {/* Mobile: show stacked cards */}
                <div className="md:hidden space-y-3">
                    {data.map((c) => (
                        <div key={c._id} className="p-4 shadow rounded bg-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold">{c.userId?.name || c.userId?.email || 'User'}</div>
                                    <div className="text-sm text-gray-600">{c.userId?.flatNumber || '-'}</div>
                                    <div className="mt-2 text-sm">{c.translatedText || c.originalText || '—'}</div>
                                    <div className="text-xs text-gray-400 mt-2">{c.category || '-'} • {c.priority || '-'}</div>
                                    {c.audioUrl && (
                                        <div className="mt-3">
                                            <audio controls className="w-full" src={makeAudioSrc(c.audioUrl)} />
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="mb-2">{c.status}</div>
                                    <div className="flex gap-2">
                                        <button onClick={() => updateStatus(c._id, "resolved")} disabled={c.status !== 'pending'} className={`px-2 py-1 rounded ${c.status === 'pending' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>Resolve</button>
                                        <button onClick={() => updateStatus(c._id, "rejected")} disabled={c.status !== 'pending'} className={`px-2 py-1 rounded ${c.status === 'pending' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>Reject</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop / tablet: table with horizontal scroll if needed */}
                <div className="hidden md:block">
                    <div className="overflow-auto">
                        <table className="min-w-full border-collapse border">
                            <thead>
                                <tr className="bg-gray-200 text-left">
                                    <th className="p-2 border">User</th>
                                    <th className="p-2 border">Flat</th>
                                    <th className="p-2 border">Summary</th>
                                    <th className="p-2 border">Category</th>
                                    <th className="p-2 border">Priority</th>
                                    <th className="p-2 border">Audio</th>
                                    <th className="p-2 border">Status</th>
                                    <th className="p-2 border">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {data.map((c) => (
                                    <tr key={c._id} className="align-top">
                                        <td className="p-2 border">{c.userId?.name || c.userId?.email || 'User'}</td>
                                        <td className="p-2 border">{c.userId?.flatNumber || '-'}</td>
                                        <td className="p-2 border max-w-md">{c.translatedText || c.originalText || '—'}</td>
                                        <td className="p-2 border">{c.category || '-'}</td>
                                        <td className="p-2 border">
                                            {c.priority ? (
                                                <span className={`px-2 py-1 rounded font-medium ${(c.priority || '').toString().toLowerCase() === 'high' ? 'bg-red-100 text-red-700' :
                                                    (c.priority || '').toString().toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>{c.priority}</span>
                                            ) : ('-')}
                                        </td>
                                        <td className="p-2 border">
                                            {c.audioUrl ? (
                                                <audio controls src={`${serverBase}/${c.audioUrl.replaceAll('\\', '/')}`} />
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="p-2 border">{c.status}</td>
                                        <td className="p-2 border">
                                            <div className="flex gap-2">
                                                {/** Disable actions if already resolved/rejected */}
                                                <button
                                                    onClick={() => updateStatus(c._id, "resolved")}
                                                    disabled={c.status !== 'pending'}
                                                    className={`px-2 py-1 rounded ${c.status === 'pending' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                                                >
                                                    Resolve
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(c._id, "rejected")}
                                                    disabled={c.status !== 'pending'}
                                                    className={`px-2 py-1 rounded ${c.status === 'pending' ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}