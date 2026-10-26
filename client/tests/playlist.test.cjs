const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const { test } = require("node:test");
const ts = require("typescript");

const sourcePath = path.resolve(__dirname, "../src/utils/playlist.ts");
const compiled = new Module(sourcePath, module);
compiled._compile(ts.transpileModule(fs.readFileSync(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, sourcePath);
const { parsePlaylistLink } = compiled.exports;
const spotifyId = "37i9dQZF1DXcBWIGoYBM5M";
const youtubeId = "PL1234567890_ab-cdEF";

test("Spotify share, localized, and embed links load the same playlist", () => {
  for (const pathname of [`/playlist/${spotifyId}`, `/intl-en/playlist/${spotifyId}`, `/embed/playlist/${spotifyId}/`]) {
    const playlist = parsePlaylistLink(`  https://open.spotify.com${pathname}?si=share-token  `);
    assert.deepEqual(playlist, {
      provider: "Spotify",
      url: `https://open.spotify.com/playlist/${spotifyId}`,
      embedUrl: `https://open.spotify.com/embed/playlist/${spotifyId}`,
    });
  }
});

test("YouTube, mobile, music, short, and embedded links keep the full playlist", () => {
  const links = [
    `https://www.youtube.com/playlist?list=${youtubeId}`,
    `https://youtube.com/watch?v=12345678901&list=${youtubeId}&index=4`,
    `https://m.youtube.com/playlist?list=${youtubeId}`,
    `https://music.youtube.com/playlist?list=${youtubeId}`,
    `https://youtu.be/12345678901?list=${youtubeId}`,
    `https://www.youtube.com/embed/videoseries?list=${youtubeId}`,
  ];
  for (const link of links) {
    const playlist = parsePlaylistLink(link);
    assert.equal(playlist.provider, "YouTube", link);
    assert.equal(playlist.url, `https://www.youtube.com/playlist?list=${youtubeId}`);
    const embed = new URL(playlist.embedUrl);
    assert.equal(embed.hostname, "www.youtube.com");
    assert.equal(embed.searchParams.get("list"), youtubeId);
    assert.equal(embed.searchParams.get("listType"), "playlist");
    assert.equal(embed.searchParams.get("index"), null);
  }
});

test("single videos, songs, missing playlists, and malformed IDs are rejected", () => {
  for (const link of [
    "", "not a URL", "https://www.youtube.com/playlist", "https://www.youtube.com/playlist?list=",
    "https://www.youtube.com/watch?v=12345678901", `https://open.spotify.com/track/${spotifyId}`,
    "https://open.spotify.com/playlist/not-an-id", "https://www.youtube.com/playlist?list=bad%22%3E%3Cscript%3E",
  ]) assert.equal(parsePlaylistLink(link), null, link);
});

test("untrusted hosts, credentials, and executable or insecure URLs are rejected", () => {
  for (const link of [
    `https://youtube.com.example.com/playlist?list=${youtubeId}`,
    `https://example.com/playlist?list=${youtubeId}`,
    `https://user:password@www.youtube.com/playlist?list=${youtubeId}`,
    `https://open.spotify.com@evil.example/playlist/${spotifyId}`,
    `https://www.youtube.com:8080/playlist?list=${youtubeId}`,
    `http://www.youtube.com/playlist?list=${youtubeId}`,
    "javascript:alert(1)", "data:text/html,<script>alert(1)</script>",
  ]) assert.equal(parsePlaylistLink(link), null, link);
});

test("saved canonical links can be restored without changing the player", () => {
  for (const link of [`https://open.spotify.com/playlist/${spotifyId}?si=sharing`, `https://music.youtube.com/playlist?list=${youtubeId}`]) {
    const playlist = parsePlaylistLink(link);
    assert.deepEqual(parsePlaylistLink(playlist.url), playlist);
  }
});
