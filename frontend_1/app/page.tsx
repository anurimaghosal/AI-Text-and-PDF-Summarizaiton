"use client";

import { useState } from "react";

export default function Home() {

  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");

  const handleSummarize = async () => {

    try {

      setSummary("Loading...");

      // =========================
      // PDF Summarization
      // =========================
      if (file) {

        const formData = new FormData();

        formData.append("file", file);

        const response = await fetch(
          "http://localhost:8000/summarize-pdf",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        console.log("PDF API Response:", data);

        setSummary(data.summary);

        return;
      }

      // =========================
      // Text Summarization
      // =========================
      if (!text) {
        alert("Please enter text or upload PDF");
        return;
      }

      const response = await fetch(
        "http://localhost:8000/summarize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        }
      );

      const data = await response.json();

      console.log("Text API Response:", data);

      setSummary(data.summary);

    } catch (error) {

      console.error(error);

      setSummary("Error generating summary");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-2xl">

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center mb-6">
          AI Text & PDF Summarizer
        </h1>

        {/* PDF Upload */}
        <div className="mb-4">

          <label className="block mb-2 font-medium">
            Upload PDF
          </label>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full border p-2 rounded-lg"
          />

          {file && (
            <p className="mt-2 text-sm text-green-600">
              Selected File: {file.name}
            </p>
          )}

        </div>

        {/* Divider */}
        <div className="text-center text-gray-500 mb-4">
          OR
        </div>

        {/* Text Input */}
        <textarea
          placeholder="Paste your text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4 h-40"
        />

        {/* Button */}
        <button
          onClick={handleSummarize}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Summarize
        </button>

        {/* Summary Output */}
        <div className="mt-6">

          <h2 className="font-semibold mb-2 text-lg">
            Summary:
          </h2>
          <div className="border p-4 rounded-lg bg-gray-50 min-h-[120px] whitespace-pre-wrap">
            {summary}
          </div>
        </div>
      </div>
    </div>
  );
}