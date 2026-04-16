import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markNotificationRead } from '../../services/notificationService';
import { AuthContext } from '../../context/AuthContext';

export default function Notifications() {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    const load = async () => {
        const res = await fetchNotifications();
        setNotifications(res.data);
    };

    useEffect(() => { load(); }, []);

    const markRead = async (id) => {
        await markNotificationRead(id);
        await load();
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Notifications</h1>

                {/* <div className="text-right">
                    <div className="text-sm">Signed in as</div>
                    <div className="font-medium">{user?.name || user?.email}</div>
                    <button onClick={() => { logout(); navigate('/'); }} className="mt-2 px-3 py-1 bg-red-500 text-white rounded">Logout</button>
                </div> */}
            </div>

            <div className="space-y-3">
                {notifications.length === 0 && <div>No notifications</div>}
                {notifications.map(n => (
                    <div key={n._id} className={`p-3 rounded shadow ${n.read ? 'bg-gray-100' : 'bg-white'}`}>
                        <div className="flex justify-between">
                            <div>
                                <div className="font-semibold">{n.title}</div>
                                <div className="text-sm text-gray-600">{n.message}</div>
                                <div className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
                            </div>
                            {!n.read && (
                                <button onClick={() => markRead(n._id)} className="ml-4 px-3 py-1 bg-indigo-600 text-white rounded">Mark read</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
