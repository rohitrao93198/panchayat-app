import { useState, useRef } from "react";
import { createComplaint } from "../../services/complaintService";
import toast from "react-hot-toast";

export default function Complaint() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        file: null
    });
    const [recording, setRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [transcript, setTranscript] = useState("");
    const mediaRef = useRef(null);
    const chunksRef = useRef([]);
    const recognitionRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRef.current = mediaRecorder;
            chunksRef.current = [];

            // Start speech recognition (client-side) if available
            try {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (SpeechRecognition) {
                    const recognition = new SpeechRecognition();
                    recognition.lang = 'en-IN';
                    recognition.interimResults = true;
                    recognition.continuous = true;
                    recognition.onresult = (event) => {
                        let interim = '';
                        let final = '';
                        for (let i = event.resultIndex; i < event.results.length; ++i) {
                            const res = event.results[i];
                            if (res.isFinal) final += res[0].transcript;
                            else interim += res[0].transcript;
                        }
                        setTranscript((prev) => (prev + final + (interim ? ` ${interim}` : '')));
                    };
                    recognition.onerror = (e) => console.debug('recognition error', e);
                    recognitionRef.current = recognition;
                    recognition.start();
                }
            } catch (e) {
                console.debug('SpeechRecognition start failed', e);
            }

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                // Create a File so it can be appended to FormData
                const file = new File([blob], `complaint-${Date.now()}.webm`, { type: blob.type });
                setForm((f) => ({ ...f, file }));
                // stop all tracks
                stream.getTracks().forEach(t => t.stop());
                // stop recognition if running
                try { recognitionRef.current?.stop(); } catch (e) { }
            };

            mediaRecorder.start();
            setRecording(true);
        } catch (err) {
            console.error("Microphone access denied", err);
            toast.error("Cannot access microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRef.current && mediaRef.current.state !== "inactive") {
            mediaRef.current.stop();
            setRecording(false);
            try { recognitionRef.current?.stop(); } catch (e) { }
        }
    };

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (f) {
            setForm({ ...form, file: f });
            const url = URL.createObjectURL(f);
            setAudioURL(url);
            // clear transcript when user chooses file
            setTranscript('');
        }
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("description", form.description);
            if (form.file) formData.append("file", form.file);
            // include transcript (speech-to-text) if available
            if (transcript && transcript.trim()) formData.append('text', transcript.trim());

            await createComplaint(formData);

            toast.success("Complaint submitted 🚀");

            setForm({ title: "", description: "", file: null });
            setAudioURL(null);
            setTranscript('');

        } catch (err) {
            console.error(err);
            toast.error("Failed ❌");
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Raise Complaint 📢</h1>

            <input
                type="text"
                placeholder="Title"
                className="w-full mb-3 p-2 border rounded"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <textarea
                placeholder="Description"
                className="w-full mb-3 p-2 border rounded"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div className="mb-3 flex items-center gap-3">
                <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                />

                {!recording ? (
                    <button onClick={startRecording} className="px-3 py-1 bg-indigo-600 text-white rounded">Record Voice</button>
                ) : (
                    <button onClick={stopRecording} className="px-3 py-1 bg-red-500 text-white rounded">Stop</button>
                )}
            </div>

            {audioURL && (
                <div className="mb-3">
                    <audio controls src={audioURL} />
                </div>
            )}

            <button
                onClick={handleSubmit}
                className="w-full bg-red-500 text-white p-2 rounded"
            >
                Submit Complaint
            </button>
        </div>
    );
}