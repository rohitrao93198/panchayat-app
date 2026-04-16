import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { fetchUnreadCount } from "../../services/notificationService";

export default function Home() {
    const navigate = useNavigate();

    // get auth context
    const { logout, user } = useContext(AuthContext);

    const [unread, setUnread] = useState(0);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const res = await fetchUnreadCount();
                if (mounted) setUnread(res.data.count || 0);
            } catch (err) {
                // ignore
            }
        };
        if (user) load();
        return () => { mounted = false; };
    }, [user]);

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Welcome, {user?.name || 'Resident'} 👋</h1>
                    <div className="text-sm text-gray-600 mt-1">{user?.flatNumber ? `Flat: ${user.flatNumber}` : user?.email}</div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/user/notifications')}
                        aria-label="Notifications"
                        className="relative inline-flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-full shadow-sm hover:ring-2 hover:ring-indigo-200 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1" />
                        </svg>
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-xs font-semibold animate-pulse border-2 border-white">{unread > 9 ? '9+' : unread}</span>
                        )}
                    </button>
                    <button onClick={() => { logout(); navigate('/'); }} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="🛠 Services" subtitle="Browse & request services" onClick={() => navigate('/user/services')} />
                <Card title="📢 Raise Complaint" subtitle="Report an issue with voice or text" onClick={() => navigate('/user/complaint')} primary />
                <Card title="📅 My Bookings" subtitle="View or cancel bookings" onClick={() => navigate('/user/bookings')} />
                <Card title="📋 My Complaints" subtitle="Track status" onClick={() => navigate('/user/my-complaints')} />
                <Card title="🤖 AI Assistant" subtitle="Ask about rules & FAQs" onClick={() => navigate('/user/chatbot')} />
                <Card title="❓ Help & Support" subtitle="Contact admins or view FAQ" onClick={() => navigate('/user/support')} />
            </div>
        </div>
    );
}

function Card({ title, subtitle, onClick, primary }) {
    return (
        <div
            onClick={onClick}
            className={`p-5 bg-white shadow rounded-xl cursor-pointer transform transition hover:scale-105 ${primary ? 'border-2 border-indigo-600' : ''}`}
        >
            <h2 className="text-lg font-bold">{title}</h2>
            {subtitle && <div className="text-sm text-gray-500 mt-2">{subtitle}</div>}
        </div>
    );
}

// Announcements panel removed per request; Home UI simplified and cards expanded.