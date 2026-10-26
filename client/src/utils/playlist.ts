export interface Playlist {
  provider: "Spotify" | "YouTube";
  url: string;
  embedUrl: string;
}

export function parsePlaylistLink(input: string): Playlist | null {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;

    if (url.hostname === "open.spotify.com") {
      const match = url.pathname.match(/^\/(?:intl-[a-z-]+\/)?(?:embed\/)?playlist\/([a-zA-Z0-9]{22})\/?$/);
      if (!match) return null;
      return {
        provider: "Spotify",
        url: `https://open.spotify.com/playlist/${match[1]}`,
        embedUrl: `https://open.spotify.com/embed/playlist/${match[1]}`,
      };
    }

    const youtubeHosts = ["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"];
    if (youtubeHosts.includes(url.hostname)) {
      const playlistId = url.searchParams.get("list");
      if (!playlistId || !/^[a-zA-Z0-9_-]{10,128}$/.test(playlistId)) return null;
      if (url.hostname !== "youtu.be" && !["/playlist", "/watch", "/embed", "/embed/videoseries"].includes(url.pathname.replace(/\/$/, ""))) return null;
      return {
        provider: "YouTube",
        url: `https://www.youtube.com/playlist?list=${playlistId}`,
        embedUrl: `https://www.youtube.com/embed?listType=playlist&list=${playlistId}&playsinline=1`,
      };
    }
  } catch {
    return null;
  }
  return null;
}
