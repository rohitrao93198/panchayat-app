import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { fetchUnreadCount } from "../services/notificationService";

export default function Sidebar() {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!user) return;
            try {
                const res = await fetchUnreadCount();
                if (mounted) setUnread(res.data.count || 0);
            } catch (err) {
                // ignore
            }
        };
        load();
        return () => { mounted = false; };
    }, [user]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    const menu = (
        <div>
            <h1 className="text-xl font-bold mb-6">Panchayat Admin</h1>

            <ul className="space-y-3">
                <li><Link to="/admin/dashboard">Dashboard</Link></li>
                <li><Link to="/admin/complaints">Complaints</Link></li>
                <li><Link to="/admin/bookings">Bookings</Link></li>
                <li><Link to="/admin/users">View Users</Link></li>
                {user && user.role === 'admin' && (
                    <>
                        <li><Link to="/admin/rules/upload">Upload Rulebook</Link></li>
                        <li><Link to="/admin/announce">Post Announcement</Link></li>
                    </>
                )}
                {user && user.role !== 'admin' && (
                    <li>
                        <Link to="/user/notifications">Notifications {unread > 0 && <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full">{unread}</span>}</Link>
                    </li>
                )}
            </ul>

            <div className="mt-6 border-t pt-4">
                <div className="text-sm">Signed in as</div>
                <div className="font-medium">{user?.name || user?.email}</div>
                <button onClick={handleLogout} className="mt-3 w-full bg-red-600 text-white py-2 rounded">Logout</button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile hamburger to open sidebar */}
            <button onClick={() => setOpen(true)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded">☰</button>

            {/* Mobile overlay menu */}
            {open && (
                <div className="fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-64 bg-gray-900 text-white p-4">
                        <button onClick={() => setOpen(false)} className="mb-4 text-sm">Close ✕</button>
                        {menu}
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden md:block fixed left-0 top-0 w-64 h-screen bg-gray-900 text-white p-4">
                {menu}
            </div>
        </>
    );
}