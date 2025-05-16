"use client";
import { useState } from "react";
import { useChat } from "../context/ChatContext";

export default function FileUploader() {
  const [file, setFile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState("");

  // list existing
  async function loadDocs() {
    const res = await fetch("/api/docs-summary");
    const json = await res.json();
    setDocs(json);
  }

  // on mount
  useEffect(() => {
    loadDocs();
  }, []);

  async function handleUpload() {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/docs-summary", {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error);
    } else {
      setDocs([json, ...docs]);
    }
  }

  async function updateSummary(id) {
    const newSum = prompt("Enter new summary:");
    if (!newSum) return;
    const res = await fetch(`/api/docs-summary/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary: newSum }),
    });
    const updated = await res.json();
    setDocs(docs.map((d) => (d._id === id ? updated : d)));
  }

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload & Summarize</button>
      {error && <p className="text-red-600">{error}</p>}

      <h2>Summaries</h2>
      <ul>
        {docs.map((doc) => (
          <li key={doc._id}>
            <strong>{doc.filename}</strong> (
            {new Date(doc.createdAt).toLocaleString()})<pre>{doc.summary}</pre>
            <button onClick={() => updateSummary(doc._id)}>Edit Summary</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
