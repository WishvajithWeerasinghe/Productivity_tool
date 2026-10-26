const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const { test } = require("node:test");
const ts = require("typescript");

const filename = path.resolve(__dirname, "../src/utils/reminders.ts");
const compiled = new Module(filename, module);
compiled._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, filename);
const { getRemainingSeconds, getMeetingStart, getDueMeetingReminders } = compiled.exports;
const meeting = { _id: "meeting-1", title: "Planning", meetingDate: "2026-10-20", meetingTime: "10:00" };
const minute = 60 * 1000;

test("focus time follows the deadline, including delayed ticks and expired sessions", () => {
  const deadline = 100000;
  assert.equal(getRemainingSeconds(deadline, 40000), 60);
  assert.equal(getRemainingSeconds(deadline, 99999), 1);
  assert.equal(getRemainingSeconds(deadline, 100000), 0);
  assert.equal(getRemainingSeconds(deadline, 300000), 0);
  const pausedSeconds = getRemainingSeconds(deadline, 55000);
  assert.equal(getRemainingSeconds(200000 + pausedSeconds * 1000, 200000), 45);
});

test("reminders become due exactly ten minutes before, never before or after the meeting", () => {
  const start = getMeetingStart(meeting);
  assert.equal(getDueMeetingReminders([meeting], start - 10 * minute - 1, new Set()).length, 0);
  assert.equal(getDueMeetingReminders([meeting], start - 10 * minute, new Set()).length, 1);
  assert.equal(getDueMeetingReminders([meeting], start - 1, new Set()).length, 1);
  assert.equal(getDueMeetingReminders([meeting], start, new Set()).length, 0);
  assert.equal(getDueMeetingReminders([meeting], start + minute, new Set()).length, 0);
});

test("opening or waking the app inside the reminder window catches upcoming meetings", () => {
  const now = getMeetingStart(meeting) - 3 * minute;
  const second = { ...meeting, _id: "meeting-2", title: "Review" };
  assert.equal(getDueMeetingReminders([meeting, second], now, new Set()).length, 2);
});

test("delivered reminders are skipped, while a changed meeting time can trigger a new reminder", () => {
  const now = getMeetingStart(meeting) - 5 * minute;
  const [due] = getDueMeetingReminders([meeting], now, new Set());
  const delivered = new Set([due.key]);
  assert.equal(getDueMeetingReminders([meeting], now, delivered).length, 0);
  assert.equal(getDueMeetingReminders([{ ...meeting, meetingTime: "10:01" }], now, delivered).length, 1);
});

test("legacy date-only meetings and invalid dates or times never produce reminders", () => {
  for (const invalid of [
    { meetingTime: undefined }, { meetingTime: "" }, { meetingTime: "24:00" },
    { meetingTime: "12:60" }, { meetingTime: "9:00" }, { meetingDate: "2026-02-30" },
    { meetingDate: "not-a-date" }, { meetingDate: "2026-13-01" },
  ]) {
    const note = { ...meeting, ...invalid };
    assert.equal(getMeetingStart(note), null, JSON.stringify(invalid));
    assert.equal(getDueMeetingReminders([note], Date.now(), new Set()).length, 0);
  }
});

test("meeting times use the local timezone and reminders can fall on the previous day", () => {
  const originalTimezone = process.env.TZ;
  try {
    for (const timezone of ["Asia/Colombo", "America/Los_Angeles"]) {
      process.env.TZ = timezone;
      const midnightMeeting = { ...meeting, meetingTime: "00:05" };
      const now = new Date(2026, 9, 19, 23, 55).getTime();
      assert.equal(getDueMeetingReminders([midnightMeeting], now, new Set()).length, 1, timezone);
      assert.equal(new Date(getMeetingStart(midnightMeeting)).getHours(), 0);
    }
    process.env.TZ = "America/New_York";
    assert.equal(getMeetingStart({ ...meeting, meetingDate: "2026-03-08", meetingTime: "02:30" }), null);
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});
