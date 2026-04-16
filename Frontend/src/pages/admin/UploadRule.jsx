import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import axios from "axios";

export default function UploadRule() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const navigate = useNavigate();
    const xhrRef = useRef(null);
    const cancelRef = useRef(null);

    const handleFile = (e) => {
        // support input and drag-drop events
        const f = (e.target && e.target.files && e.target.files[0]) ||
            (e.currentTarget && e.currentTarget.files && e.currentTarget.files[0]) ||
            (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) ||
            null;
        console.debug("file selected:", f);
        setFile(f);
        setResult(null);
        setProgress(0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.debug("submitting file:", file);
        if (!file) {
            const el = document.getElementById("rule-file-input");
            if (el) el.focus();
            return setResult({ error: "Please select a PDF file." });
        }

        setLoading(true);
        setProgress(0);

        const form = new FormData();
        form.append("file", file);

        const source = axios.CancelToken.source();
        cancelRef.current = source;

        try {
            const res = await API.post("/rules/upload", form, {
                cancelToken: source.token,
                onUploadProgress: (event) => {
                    if (event.lengthComputable) {
                        const pct = Math.round((event.loaded / event.total) * 100);
                        setProgress(pct);
                    }
                }
            });

            const data = res.data || {};
            if (data.savedFile) data.savedFile = data.savedFile.replaceAll('\\', '/');
            setResult({ success: data.message || "Uploaded", data });
        } catch (err) {
            if (axios.isCancel(err)) {
                setResult({ error: "Upload cancelled" });
            } else if (err.response) {
                setResult({ error: err.response.data?.error || err.response.data?.message || `Server ${err.response.status}` });
            } else {
                setResult({ error: err.message || "Upload failed" });
            }
        } finally {
            setLoading(false);
        }
    };

    const cancelUpload = () => {
        if (cancelRef.current) {
            cancelRef.current.cancel("User cancelled upload");
            setLoading(false);
            setProgress(0);
            setResult({ error: "Upload cancelled" });
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Upload Rulebook (PDF)</h2>


            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        id="rule-file-input"
                        name="file"
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFile}
                        className=""
                    />
                </div>

                <div className="text-sm text-gray-600">
                    {file ? (
                        <>Selected: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)</>
                    ) : (
                        <>No file selected — choose a PDF to upload.</>
                    )}
                </div>

                {progress > 0 && (
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mt-2">
                        <div className="bg-indigo-600 h-full" style={{ width: `${progress}%` }} />
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {loading ? `Uploading (${progress}%)` : "Upload"}
                    </button>

                    {loading ? (
                        <button type="button" onClick={cancelUpload} className="px-3 py-2 bg-red-500 text-white rounded">Cancel</button>
                    ) : (
                        <button type="button" onClick={() => navigate(-1)} className="px-3 py-2 bg-gray-100 rounded">Back</button>
                    )}
                </div>
            </form>

            {result?.error && (
                <div className="mt-4 text-red-600">Error: {result.error}</div>
            )}

            {result?.success && (
                <div className="mt-4 text-green-700">
                    <div className="font-medium">{result.success}</div>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-sm whitespace-pre-wrap">{JSON.stringify(result.data, null, 2)}</pre>
                    {result.data?.savedFile && (
                        <div className="mt-2">
                            Saved file: <a className="text-indigo-600 underline" href={`/${result.data.savedFile}`} target="_blank" rel="noreferrer">{result.data.savedFile}</a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
