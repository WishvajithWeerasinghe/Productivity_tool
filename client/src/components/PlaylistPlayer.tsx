import { FormEvent, useState } from "react";
import { parsePlaylistLink, Playlist } from "../utils/playlist";

function readSavedPlaylist(storageKey: string): Playlist | null {
  try {
    return parsePlaylistLink(localStorage.getItem(storageKey) ?? "");
  } catch {
    return null;
  }
}

export default function PlaylistPlayer({ userId }: { userId: string }) {
  const storageKey = `devflow:focus-playlist:${userId}`;
  const [playlist, setPlaylist] = useState(() => readSavedPlaylist(storageKey));
  const [link, setLink] = useState(() => playlist?.url ?? "");
  const [error, setError] = useState("");

  function loadPlaylist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPlaylist = parsePlaylistLink(link);
    if (!nextPlaylist) {
      setError("Paste a Spotify or YouTube playlist link. For YouTube, use a link that includes the playlist.");
      return;
    }

    setPlaylist(nextPlaylist);
    setLink(nextPlaylist.url);
    setError("");
    try {
      localStorage.setItem(storageKey, nextPlaylist.url);
    } catch {
      // Playback remains available when browser storage is disabled.
    }
  }

  function removePlaylist() {
    setPlaylist(null);
    setLink("");
    setError("");
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Removing the player still stops playback without browser storage.
    }
  }

  return (
    <section aria-labelledby="focus-music-heading" className="surface min-w-0 p-5">
      <div className="mb-4">
        <h2 id="focus-music-heading" className="font-bold text-slate-800">Focus music</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">A playlist to keep you company while you focus.</p>
      </div>

      <form onSubmit={loadPlaylist} className="space-y-3">
        <label htmlFor="focus-playlist-link" className="block text-xs font-medium text-slate-600">Playlist link</label>
        <input
          id="focus-playlist-link"
          type="url"
          required
          value={link}
          onChange={(event) => { setLink(event.target.value); setError(""); }}
          placeholder="Paste a Spotify or YouTube playlist link"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "focus-playlist-help focus-playlist-error" : "focus-playlist-help"}
          className="field w-full px-3 py-2.5 text-sm"
        />
        <p id="focus-playlist-help" className="text-xs leading-5 text-slate-500">Load your playlist, then press Play in the player.</p>
        {error && <p id="focus-playlist-error" role="alert" className="text-xs leading-5 text-rose-600">{error}</p>}
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={!link.trim()} className="button-primary px-4 py-2 text-sm">
            {playlist ? "Update playlist" : "Load playlist"}
          </button>
          {playlist && (
            <button type="button" onClick={removePlaylist} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">Remove</button>
          )}
        </div>
      </form>

      {playlist ? (
        <div className="mt-4">
          <iframe
            key={playlist.embedUrl}
            src={playlist.embedUrl}
            title={`${playlist.provider} focus playlist player`}
            width="100%"
            height={playlist.provider === "Spotify" ? 352 : 224}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
            className="block w-full rounded-xl border-0 bg-slate-50"
          />
          <a href={playlist.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-semibold text-violet-700 hover:text-violet-900">
            Open playlist in {playlist.provider} ↗
          </a>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center text-xs leading-5 text-slate-500">
          Add your favourite playlist to start listening.
        </div>
      )}
    </section>
  );
}
