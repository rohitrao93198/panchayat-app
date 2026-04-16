import { useState } from "react";
import { sendMessage } from "../../services/chatbotService";
import toast from "react-hot-toast";

export default function Chatbot() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);

        setInput("");

        setLoading(true);
        try {
            const res = await sendMessage(input);

            const botMsg = {
                sender: "bot",
                text: res.data?.answer || "Not mentioned in rulebook",
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            toast.error("AI failed ❌");
            setMessages((prev) => [...prev, { sender: "bot", text: "AI failed to respond" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto flex flex-col h-screen">
            <h1 className="text-2xl font-bold mb-4">Panchayat AI 🤖</h1>

            {/* Chat Box */}
            <div className="flex-1 overflow-y-auto border p-4 rounded mb-3 bg-gray-50">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"
                            }`}
                    >
                        <span
                            className={`inline-block px-3 py-2 rounded ${msg.sender === "user"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-300"
                                }`}
                        >
                            {msg.text}
                        </span>
                    </div>
                ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 p-2 border rounded"
                    placeholder="Ask something..."
                />

                <button
                    onClick={handleSend}
                    className="bg-green-500 text-white px-4 rounded"
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    );
}