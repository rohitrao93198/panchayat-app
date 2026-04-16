import { useEffect, useState } from "react";
import { getMyBookings } from "../../services/bookingService";

export default function Booking() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        const res = await getMyBookings();
        setBookings(res.data || []);
    };

    return (
        <div className="p-6 flex justify-center">
            <div className="w-full max-w-4xl">
                <h1 className="text-2xl font-bold mb-4">My Bookings 📅</h1>

                {bookings.length === 0 && (
                    <div className="p-6 bg-white shadow rounded text-center text-gray-600">You have no bookings yet.</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    {bookings.map((b) => (
                        <div key={b._id} className="p-4 shadow rounded bg-white">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h2 className="font-semibold text-lg">{b.service?.name || 'Service'}</h2>
                                    <p className="text-sm text-gray-600">{b.date} • {b.time}</p>
                                </div>

                                <div className="shrink-0 text-right">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${b.status === 'approved' ? 'bg-green-100 text-green-800' : b.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{b.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}