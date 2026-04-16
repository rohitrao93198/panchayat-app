import { useEffect, useState } from "react";
import { getMyBookings } from "../../services/bookingService";

export default function Booking() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        const res = await getMyBookings();
        setBookings(res.data);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">My Bookings 📅</h1>

            {bookings.map((b) => (
                <div key={b._id} className="p-4 shadow mb-3 rounded">
                    <h2 className="font-bold">{b.service?.name}</h2>
                    <p>{b.date} - {b.time}</p>
                    <p>Status: <b>{b.status}</b></p>
                </div>
            ))}
        </div>
    );
}