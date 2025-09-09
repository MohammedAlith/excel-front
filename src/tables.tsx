import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdDelete, MdEdit } from "react-icons/md";
import { IoMdArrowRoundBack } from "react-icons/io";
import { TbPlayerTrackPrevFilled, TbPlayerTrackNextFilled } from "react-icons/tb";
import { LoadingGear } from "./loading";

interface RowData {
  [key: string]: any;
}

const Tables: React.FC = () => {
  const PreviousIcon = TbPlayerTrackPrevFilled as React.ComponentType;
  const NextIcon = TbPlayerTrackNextFilled as React.ComponentType;
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

  // Fetch available tables on mount
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://excel-node-4e1n.onrender.com/tables");
      const list: string[] = await res.json();
      setTables(list);

      if (list.length > 0) {
        const latestTable = list[list.length - 1];
        setSelectedTable(latestTable);
        fetchPageData(latestTable, 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPageData = async (tableName: string, pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://excel-node-4e1n.onrender.com/data/${tableName}?page=${pageNum}&limit=${rowsPerPage}`
      );
      const result = await res.json();
      setCurrentRows(result.data || []);
      setColumns(result.data?.length > 0 ? Object.keys(result.data[0]) : []);
      setTotalPages(result.totalPages);
      setTotalRows(result.totalRows);
      setPage(pageNum); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!selectedTable) return;
    if (!window.confirm(`Delete '${selectedTable}'?`)) return;
    try {
      await fetch(`https://excel-node-4e1n.onrender.com/table/${selectedTable}`, { method: "DELETE" });
      setTables((prev) => prev.filter((t) => t !== selectedTable));
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
    setEditValues((prev) => ({ ...prev, [col]: value }));
  };

  const handleSaveRow = async () => {
  if (!selectedTable || !editingRow) return;
  try {
    // Always use the backend's serial ID
    const id = editingRow.table_id;
    if (!id) throw new Error("Row ID not found (missing table_id)");

    const res = await fetch(
      `https://excel-node-4e1n.onrender.com/data/${selectedTable}/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editValues),
      }
    );

    if (!res.ok) throw new Error("Update failed");
    const updated = await res.json();

    setCurrentRows((prev) =>
      prev.map((r) => (r.table_id === id ? updated.row : r))
    );
    setEditingRow(null);
    setIsModalOpen(false);
  } catch (err) {
    console.error(err);
    alert("Save failed");
  }
};

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen w-full ">
        <LoadingGear />
      </div>
    );

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <header className="text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Excel</h1>
        <Link to="/">
          <button className="bg-gray-700 px-4 py-2 rounded text-white flex items-center gap-2">
            <BackIcon /> Back
          </button>
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 p-4 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-white">Tables</h2>
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
            {tables.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedTable(t);
                  fetchPageData(t, 1); 
                }}
                className={`px-4 py-2 rounded-lg text-left ${
                  selectedTable === t
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={handleDeleteTable}
            className="mt-4 bg-red-600 px-4 py-2 rounded text-white flex items-center gap-2"
          >
            <DeleteIcon /> Delete
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {selectedTable ? (
            <div className="flex flex-col gap-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 shadow rounded-lg text-center">
                  <h3 className="text-lg font-semibold">Total Tables</h3>
                  <p className="text-2xl font-bold">{tables.length}</p>
                </div>
                <div className="bg-white p-4 shadow rounded-lg text-center">
                  <h3 className="text-lg font-semibold">Rows in Table</h3>
                  <p className="text-2xl font-bold">{totalRows}</p>
                </div>
                <div className="bg-white p-4 shadow rounded-lg text-center">
                  <h3 className="text-lg font-semibold">Current Table</h3>
                  <p className="text-lg">{selectedTable}</p>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold">{selectedTable}</h3>
                  <button
                    onClick={() => handleExport(selectedTable)}
                    className="bg-green-600 px-4 py-2 text-white rounded"
                  >
                    Export
                  </button>
                </div>
                {currentRows.length === 0 ? (
                  <p>No rows available</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border rounded">
                      <thead className="bg-gray-100">
                        <tr>
                          {columns.map((col,idx) => (
                            <th
                              key={`${col}-${idx}`}
                              className="border px-4 py-2 text-left"
                            >
                              {col}
                            </th>
                          ))}
                          <th className="border px-4 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
               {currentRows.map((row, rowIndex) => (
                    <tr
                      key={row.teacherId ?? row.ID ?? row.id ?? row._id ?? rowIndex}
                      className="hover:bg-gray-50"
                    >
                      {columns.map((col, colIndex) => (
                        <td key={`${col}-${rowIndex}-${colIndex}`} className="border px-4 py-2">
                          {row[col]}
                        </td>
                      ))}
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => handleEditRow(row)}
                          className="bg-blue-600 px-2 py-1 text-white rounded"
                        >
                          <EditIcon />
                        </button>
                      </td>
                    </tr>
                  ))}

                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                <div className="flex justify-between mt-4 items-center">
                  <button
                    disabled={page <= 1}
                    onClick={() =>
                      selectedTable && fetchPageData(selectedTable, page - 1)
                    }
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                  >
                    <PreviousIcon />
                  </button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() =>
                      selectedTable && fetchPageData(selectedTable, page + 1)
                    }
                    className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                  >
                    <NextIcon />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p>No table selected</p>
          )}
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && editingRow && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm max-h-[80vh] shadow-lg overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-center">Edit Row</h2>
            <div className="flex flex-col gap-3">
              {columns.map((col,idx) => (
                <div key={`${col}-${idx}`} className="flex flex-col">
                  <label className="text-sm font-medium mb-1">{col}</label>
                  <input
                    type="text"
                    value={editValues[col] ?? ""}
                    onChange={(e) => handleInputChange(col, e.target.value)}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRow}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;
