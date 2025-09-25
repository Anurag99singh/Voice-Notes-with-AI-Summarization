import React, { useEffect } from "react";
import { useAppContext } from "../Context/FetchContext";

function App() {
  const {
    notes,
    isRecording,
    startRecording,
    stopRecording,
    editingId,
    editText,
    setEditText,
    saveEdit,
    startEdit,
    handleDelete,
    generateSummary,
    shouldDisableGenerate,
    summarizingIds,
    fetchNotes,
    loading,
  } = useAppContext();

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="min-h-screen w-full   flex items-start justify-between">
      <div className="mx-auto min-h-screen bg-[#ffffff] lg:w-[30%] flex flex-col gap-3 items-center p-2">
        <p className="text-4xl font-bold ">Voice Notes</p>

        {!isRecording ? (
          <button
            onClick={startRecording}
            className={`bg-black text-white mt-8 p-2 w-full transition-all duration-300 ease-in-out  hover:cursor-pointer rounded-md ${
              loading &&
              "bg-blue-400 scale-110 transition-all duration-300 ease-in-out"
            }`}
          >
            {loading ? "Creating Note" : "Start Recording"}{" "}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-600 text-white hover:cursor-pointer mt-8 p-2 w-full rounded-md"
          >
            Stop Recording
          </button>
        )}

        <div className="flex flex-col w-full p-2 space-y-3">
          {notes?.map((note) => (
            <div key={note._id} className="border p-3 rounded">
              <p className="text-sm text-gray-700">
                {note.title || (note.transcript?.slice(0, 120) ?? "No text")}
              </p>
              {editingId === note._id ? (
                <div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full mt-2 hover:cursor-pointer p-2 border"
                  />
                  <button
                    onClick={() => saveEdit(note._id)}
                    className="mt-2 px-4 py-1 bg-slate-200 hover:cursor-pointer rounded-md"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => startEdit(note)}
                    className="px-4 py-1 bg-slate-200 hover:cursor-pointer rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="px-4 py-1 bg-slate-200 hover:cursor-pointer rounded-md"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => generateSummary(note._id)}
                    disabled={
                      shouldDisableGenerate(note) ||
                      summarizingIds.has(note._id)
                    }
                    className={`rounded-md text-white px-3 hover:cursor-pointer py-1 ${
                      shouldDisableGenerate(note) ? "bg-gray-400" : "bg-black"
                    }`}
                  >
                    {summarizingIds.has(note._id)
                      ? "Summarizing..."
                      : note.summary
                      ? "Regenerate Summary"
                      : "Generate Summary"}
                  </button>
                </div>
              )}

              {/* {note.summary && (
                <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                  <strong>Summary:</strong>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: note.summary.replace(/\n/g, "<br/>"),
                    }}
                  />
                </div>
              )} */}
              {note.summary && (
                <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                  <strong>Summary:</strong>
                  {note.summary.split("\n").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
