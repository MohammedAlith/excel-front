import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdDelete, MdEdit } from "react-icons/md";
import { IoMdArrowRoundBack } from "react-icons/io";
import { LoadingGear } from "./loading";

interface RowData { [key: string]: any; }

const Tables: React.FC = () => {
  const DeleteIcon = MdDelete as React.ComponentType;
  const BackIcon = IoMdArrowRoundBack as React.ComponentType;
  const EditIcon = MdEdit as React.ComponentType;

  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const [currentRows, setCurrentRows] = useState<RowData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [editingRow, setEditingRow] = useState<RowData | null>(null);
  const [editValues, setEditValues] = useState<RowData>({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [rowsPerPage] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRows, setTotalRows] = useState<number>(0);

  useEffect(() => { fetchTables(); }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://excel-node-4e1n.onrender.com/tables");
      const list: string[] = await res.json();
      setTables(list);
      if (list.length > 0) {
        setSelectedTable(list[list.length - 1]);
      }
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  // fetch data when table or page changes
  useEffect(() => {
    if (selectedTable) fetchPageData(selectedTable, page);
  }, [selectedTable, page]);

  const fetchPageData = async (tableName: string, pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://excel-node-4e1n.onrender.com/data/${tableName}?page=${pageNum}&limit=${rowsPerPage}`);
      const result = await res.json();

      setCurrentRows(result.data || []);
      setColumns(result.data?.length > 0 ? Object.keys(result.data[0]) : []);
      setTotalPages(result.totalPages);
      setTotalRows(result.totalRows);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleDeleteTable = async () => {
    if (!selectedTable) return;
    if (!window.confirm(`Delete '${selectedTable}'?`)) return;
    try {
      await fetch(`https://excel-node-4e1n.onrender.com/table/${selectedTable}`, { method: "DELETE" });
      setTables(prev => prev.filter(t => t !== selectedTable));
      setSelectedTable(null);
      setCurrentRows([]);
      setColumns([]);
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleExport = (table: string) => {
    const url = `https://excel-node-4e1n.onrender.com/table/${table}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `${table}.xlsx`;
    link.click();
  };

  const handleEditRow = (row: RowData) => {
    setEditingRow(row);
    setEditValues({ ...row });
    setIsModalOpen(true);
  };

  const handleInputChange = (col: string, value: string) => {
    setEditValues(prev => ({ ...prev, [col]: value }));
  };

  const handleSaveRow = async () => {
    if (!selectedTable || !editingRow) return;
    try {
      const id = editingRow.ID ?? editingRow.id ?? editingRow._id;
      const res = await fetch(
        `https://excel-node-4e1n.onrender.com/data/${selectedTable}/${id}`,
        { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editValues) }
      );
      if (!res.ok) throw new Error("Update failed");
      const updated = await res.json();
      setCurrentRows(prev =>
        prev.map(r => (r.ID ?? r.id ?? r._id) === id ? updated.row : r)
      );
      setEditingRow(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen w-full"><LoadingGear /></div>;

  return (
    <div className="h-screen w-full flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 pb-2 flex flex-col justify-between">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold">Tables</h1>
          <div className="flex flex-col gap-3">
            {tables.map(t => (
              <button
                key={t}
                onClick={() => { setPage(1); setSelectedTable(t); }}
                className={`px-4 py-2 rounded-lg text-left ${selectedTable === t ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
              >{t}</button>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <button onClick={handleDeleteTable} className="bg-red-600 px-4 py-2 rounded text-white"><DeleteIcon /></button>
          <Link to="/"><button className="bg-gray-700 px-4 py-2 rounded text-white"><BackIcon /></button></Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto flex flex-col justify-center m-4">
        {selectedTable ? (
          <div className="w-full max-w-6xl flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">{selectedTable}</h3>
              <div className="flex gap-4 items-center">
                <span>showing {totalRows} rows</span>
                <button onClick={() => handleExport(selectedTable)} className="bg-green-600 px-4 py-2 text-white rounded">Export</button>
              </div>
            </div>

            {currentRows.length === 0 ? <p>No rows available</p> :
              <div className="overflow-x-auto border rounded shadow">
                <table className="min-w-full border-collapse">
                  <thead className="bg-gray-200">
                    <tr>
                      {columns.map(col => <th key={col} className="border px-4 py-2">{col}</th>)}
                      <th className="border px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map(row => (
                      <tr key={row.ID ?? row.id ?? row._id} className="hover:bg-gray-50">
                        {columns.map(col => <td key={col} className="border px-4 py-2">{row[col]}</td>)}
                        <td className="border px-4 py-2">
                          <button onClick={() => handleEditRow(row)} className="bg-blue-600 px-2 py-1 text-white rounded"><EditIcon /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }

            {/* Pagination */}
            <div className="flex justify-between mt-2 items-center">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">Prev</button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        ) : <p>No table selected</p>}
      </main>

      {/* Modal */}
      {isModalOpen && editingRow && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Row</h2>
            <div className="flex flex-col gap-2">
              {columns.map(col => (
                <div key={col} className="flex flex-col">
                  <label>{col}</label>
                  <input type="text" value={editValues[col] ?? ""} onChange={e => handleInputChange(col, e.target.value)} className="border rounded px-2 py-1"/>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
              <button onClick={handleSaveRow} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;
