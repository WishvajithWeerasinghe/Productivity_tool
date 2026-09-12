import { useState } from "react";
import { useJournalEntries, useCreateEntry } from "../hooks/useJournal";

export default function Journal() {
  const { data: entries = [] } = useJournalEntries();
  const createEntry = useCreateEntry();
  const [content, setContent] = useState("");

  function handleSave() {
    if (!content.trim()) return;
    createEntry.mutate(content.trim());
    setContent("");
  }

  return (
    <div className="bg-slate-900 rounded-xl p-4">
      <h2 className="font-semibold mb-3 text-slate-300">Dev Journal</h2>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What did you work on today? Any blockers?"
        rows={4}
        className="w-full px-3 py-2 rounded bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
      />
      <button onClick={handleSave} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm">
        Save entry
      </button>

      <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
        {entries.map((entry) => (
          <div key={entry._id} className="bg-slate-800 rounded-lg p-3 text-sm">
            <p className="text-slate-400 text-xs mb-1">
              {new Date(entry.date).toLocaleDateString()}
            </p>
            <p className="whitespace-pre-wrap">{entry.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
