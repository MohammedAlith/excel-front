import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoCloudUploadSharp } from "react-icons/io5";

interface UploadResponse {
  message: string;
  table: string;
  inserted: number;
  error?: string;
}

export default function Upload() {
   const UploadIcon = IoCloudUploadSharp as React.ComponentType;
  const [file, setFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return alert("Select an Excel file first");

    const formData = new FormData();
    formData.append("excel", file);
    if (tableName) formData.append("tableName", tableName);

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse = await res.json();
      if (!res.ok) throw new Error(data.error || JSON.stringify(data));

      setMessage(`Upload successful! Table: ${data.table}`);
      setFile(null);
      setTableName("");
    } catch (err: any) {
      console.error(err);
      setMessage("Upload failed: " + err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
  <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
    <h2 className="text-2xl font-semibold mb-4 text-center">Upload Excel File</h2>
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <label>
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="border p-2 rounded hidden"
      />
      <div className="flex flex-col items-center justify-center outline-dashed outline-blue-300 rounded-2xl p-4 transition hover:border-blue-500 hover:bg-blue-50">
            <p className="text-blue-400 text-7xl"><UploadIcon/></p>
            <p className="text-blue-700 font-medium text-lg">Click or drag files here</p>
          </div>
          </label>
            {file && (
            <p className="mt-2 text-sm text-gray-700 text-center">
               Selected file: <span className="font-medium">{file.name}</span>
            </p>
          )}
     

      {/* Buttons in same row */}
      <div className="flex gap-4 mt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Upload
        </button>

        <button
          type="button"
          onClick={() => navigate("/tables")}
          className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
        >
          Show Tables
        </button>
      </div>
    </form>

    {message && <p className="mt-4 text-center text-green-600">{message}</p>}
  </div>
</div>

  );
};


