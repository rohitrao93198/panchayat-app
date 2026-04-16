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
        <div className="p-4 max-w-3xl mx-auto flex flex-col h-screen">
            <h1 className="text-2xl font-bold mb-3 text-center">Panchayat AI 🤖</h1>

            {/* Chat Box */}
            <div className="flex-1 overflow-y-auto border p-3 rounded mb-3 bg-gray-50 space-y-2">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500">Ask about rules or services — the assistant will reply.</div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`inline-block px-3 py-2 rounded max-w-[80%] wrap-break-words ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input - sticky on small screens */}
            <div className="mt-auto">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        className="flex-1 p-2 border rounded"
                        placeholder="Ask something..."
                        aria-label="Chat input"
                    />

                    <button
                        onClick={handleSend}
                        className="bg-green-500 text-white px-4 rounded min-w-[80px]"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}