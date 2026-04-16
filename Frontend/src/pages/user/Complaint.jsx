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

    // 🎤 START RECORDING
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream);
            mediaRef.current = mediaRecorder;
            chunksRef.current = [];

            // 🎯 SPEECH RECOGNITION (Desktop only)
            try {
                const SpeechRecognition =
                    window.SpeechRecognition || window.webkitSpeechRecognition;

                if (SpeechRecognition) {
                    const recognition = new SpeechRecognition();
                    recognition.lang = "en-IN";
                    recognition.interimResults = false;
                    recognition.continuous = false;

                    recognition.onresult = (event) => {
                        let finalText = "";

                        for (let i = 0; i < event.results.length; i++) {
                            if (event.results[i].isFinal) {
                                finalText += event.results[i][0].transcript + " ";
                            }
                        }

                        if (finalText.trim()) {
                            setTranscript(finalText.trim());
                        }
                    };

                    recognition.onerror = (e) => {
                        console.log("Speech error:", e);
                    };

                    recognitionRef.current = recognition;
                    recognition.start();
                }
            } catch (err) {
                console.log("SpeechRecognition not supported", err);
            }

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
                const blob = new Blob(chunksRef.current, { type: mimeType });

                const url = URL.createObjectURL(blob);
                setAudioURL(url);

                // map mime to extension
                const extMap = {
                    'audio/webm': '.webm',
                    'audio/mp4': '.mp4',
                    'audio/mpeg': '.mp3',
                    'audio/wav': '.wav'
                };

                const ext = extMap[blob.type] || '.webm';
                const fileName = `complaint-${Date.now()}${ext}`;

                const file = new File([blob], fileName, { type: blob.type });

                setForm((prev) => ({ ...prev, file }));

                stream.getTracks().forEach((track) => track.stop());

                try {
                    recognitionRef.current?.stop();
                } catch { }
            };

            mediaRecorder.start();
            setRecording(true);
        } catch (err) {
            console.error(err);
            toast.error("Microphone access denied ❌");
        }
    };

    // 🛑 STOP RECORDING
    const stopRecording = () => {
        if (mediaRef.current && mediaRef.current.state !== "inactive") {
            mediaRef.current.stop();
            setRecording(false);

            try {
                recognitionRef.current?.stop();
            } catch { }
        }
    };

    // 📁 FILE UPLOAD
    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            setForm((prev) => ({ ...prev, file }));
            setAudioURL(URL.createObjectURL(file));
            setTranscript(""); // reset transcript
        }
    };

    // 🚀 SUBMIT (FINAL FIXED)
    const handleSubmit = async () => {
        try {
            const formData = new FormData();

            formData.append("title", form.title);
            formData.append("description", form.description);

            // ✅ ONLY SEND TEXT IF AVAILABLE (VERY IMPORTANT)
            if (transcript && transcript.trim()) {
                formData.append("text", transcript.trim());
            }

            // ✅ FILE (mobile ke liye zaruri)
            if (form.file) {
                formData.append("file", form.file);
            }

            // ❌ VALIDATION
            if (
                !form.file &&
                !transcript.trim() &&
                !form.description.trim() &&
                !form.title.trim()
            ) {
                toast.error("Please enter or record complaint");
                return;
            }

            await createComplaint(formData);

            toast.success("Complaint submitted 🚀");

            setForm({ title: "", description: "", file: null });
            setAudioURL(null);
            setTranscript("");
        } catch (err) {
            console.error(err);
            toast.error("Submission failed ❌");
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Raise Complaint 📢</h1>

            {/* INFO */}
            <p className="text-xs text-gray-500 mb-2">
                ⚠️ Desktop = instant speech-to-text | Mobile = server processing
            </p>

            {/* TITLE */}
            <input
                type="text"
                placeholder="Title"
                className="w-full mb-3 p-2 border rounded"
                value={form.title}
                onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                }
            />

            {/* DESCRIPTION */}
            <textarea
                placeholder="Description"
                className="w-full mb-3 p-2 border rounded"
                value={form.description}
                onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                }
            />

            {/* AUDIO + RECORD */}
            <div className="mb-3 flex flex-col sm:flex-row gap-3">
                <label className="px-3 py-2 bg-gray-100 rounded cursor-pointer">
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    Attach Audio
                </label>

                {!recording ? (
                    <button
                        onClick={startRecording}
                        className="px-3 py-1 bg-indigo-600 text-white rounded"
                    >
                        Record Voice
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                        Stop
                    </button>
                )}
            </div>

            {/* AUDIO PLAYER */}
            {audioURL && (
                <audio controls className="w-full mb-3" src={audioURL} />
            )}

            {/* 🎤 TRANSCRIPT */}
            {transcript && (
                <div className="mb-3 p-2 bg-gray-100 rounded text-sm">
                    🎤 {transcript}
                </div>
            )}

            {/* SERVER PROCESS MESSAGE */}
            {!transcript && form.file && (
                <div className="text-xs text-gray-500 mb-2">
                    🎧 Voice will be processed on server...
                </div>
            )}

            {/* SUBMIT */}
            <button
                onClick={handleSubmit}
                className="w-full bg-red-500 text-white p-2 rounded"
            >
                Submit Complaint
            </button>
        </div>
    );
}