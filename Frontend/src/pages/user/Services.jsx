import { useEffect, useState } from "react";
import { getServices, createBooking } from "../../services/bookingService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Services() {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [form, setForm] = useState({ date: "", time: "" });

    const navigate = useNavigate();

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        const res = await getServices();
        setServices(res.data);
    };

    const openModal = (service) => {
        setSelectedService(service);
    };

    const closeModal = () => {
        setSelectedService(null);
        setForm({ date: "", time: "" });
    };

    const handleSubmit = async () => {
        try {
            await createBooking({
                serviceId: selectedService._id,
                date: form.date,
                time: form.time
            });

            toast.success("Booking successful 🚀");
            closeModal();
            navigate("/user/bookings");

        } catch (err) {
            toast.error("Booking failed ❌");
        }
    };

    return (
        <div className="p-6 flex justify-center">
            <div className="w-full max-w-5xl">
                <h1 className="text-2xl font-bold mb-4">Services 🛠️</h1>

                {/* Services Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((s) => (
                        <div key={s._id} className="p-4 shadow rounded-xl bg-white flex flex-col justify-between">
                            <div>
                                <h2 className="text-lg font-bold mb-1">{s.name}</h2>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{s.description}</p>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-green-600 font-bold">₹{s.price}</div>
                                <button
                                    onClick={() => openModal(s)}
                                    className="ml-4 bg-blue-500 text-white px-3 py-1 rounded"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 🔥 MODAL */}
                {selectedService && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
                        <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">

                            <h2 className="text-xl font-bold mb-4">Book {selectedService.name}</h2>

                            {/* Date */}
                            <input
                                type="date"
                                className="w-full mb-3 p-2 border rounded"
                                value={form.date}
                                onChange={(e) =>
                                    setForm({ ...form, date: e.target.value })
                                }
                            />

                            {/* Time */}
                            <input
                                type="time"
                                className="w-full mb-3 p-2 border rounded"
                                value={form.time}
                                onChange={(e) =>
                                    setForm({ ...form, time: e.target.value })
                                }
                            />

                            {/* Buttons */}
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={closeModal}
                                    className="px-3 py-1 bg-gray-300 rounded"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSubmit}
                                    className="px-3 py-1 bg-blue-500 text-white rounded"
                                >
                                    Confirm Booking
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}