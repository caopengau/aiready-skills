"use client";
import { useState } from "react";

export default function RequestForm() {
  const [email, setEmail] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const endpoint = process.env.NEXT_PUBLIC_REQUEST_URL;
      if (!endpoint) {
        throw new Error("Submission endpoint not configured");
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, repoUrl, notes })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to submit request");
      }

      setStatus("success");
      setMessage("Thanks! We got your request. We'll email you within 24-48 hours.");
      setEmail("");
      setRepoUrl("");
      setNotes("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-8">
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Free Audit</h3>
      <p className="text-slate-600 mb-6">Get a detailed analysis of your codebase. We'll run our tools and send a PDF report.</p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">GitHub Repo URL</label>
          <input
            type="url"
            required
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anything specific you'd like us to focus on"
            className="w-full rounded-md border border-slate-300 px-3 py-2 h-28 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {status === "loading" ? "Submitting..." : "Request Report"}
          </button>
          {status === "success" && (
            <span className="text-green-700">{message}</span>
          )}
          {status === "error" && (
            <span className="text-red-700">{message}</span>
          )}
        </div>
      </form>
      <p className="text-xs text-slate-500 mt-4">We'll never share your data. We'll email from the address on the site footer.</p>
    </div>
  );
}
