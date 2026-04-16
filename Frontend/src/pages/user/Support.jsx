import { useState } from 'react';
import API from '../../services/api';

export default function Support() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await API.post('/support', { name, email, message });
            setSent(true);
            setName(''); setEmail(''); setMessage('');
        } catch (err) {
            console.error(err);
            alert('Failed to send. Try again later.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex">

            <div className="flex-1 flex justify-center">
                <div className="w-full max-w-3xl p-6">
                    <h1 className="text-2xl font-bold mb-4 text-center">Help & Support</h1>

                    <div className="bg-white shadow rounded-lg p-6">
                        {sent && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">Message sent — we'll reply soon.</div>}

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1">Name</label>
                                    <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1">Email</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Message</label>
                                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6} className="w-full p-2 border rounded" required />
                            </div>

                            <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
                                <button type="submit" disabled={sending} className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded">{sending ? 'Sending...' : 'Send Message'}</button>
                                <div className="text-sm text-gray-500">Or contact admin directly via email/phone below.</div>
                            </div>
                        </form>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-3 bg-gray-50 rounded text-center">
                                <div className="font-medium">How to raise a complaint</div>
                                <div className="text-sm text-gray-600 mt-1">Use the "Raise Complaint" card on Home to record or type an issue.</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded text-center">
                                <div className="font-medium">Booking a service</div>
                                <div className="text-sm text-gray-600 mt-1">Go to Services to request and manage bookings.</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded text-center">
                                <div className="font-medium">Emergency contact</div>
                                <div className="text-sm text-gray-600 mt-1">Email admin@panchayat.local or call +91 99999 99999</div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2 justify-center">
                            <a href="mailto:admin@panchayat.local" className="px-4 py-2 bg-gray-100 rounded">Email Admin</a>
                            <a href="tel:+919999999999" className="px-4 py-2 bg-green-100 text-green-800 rounded">Call</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
