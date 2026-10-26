const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const { test } = require("node:test");
const ts = require("typescript");

const sourcePath = path.resolve(__dirname, "../src/utils/journalCalendar.ts");
const compiled = new Module(sourcePath, module);
compiled._compile(ts.transpileModule(fs.readFileSync(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, sourcePath);
const { getDateKey, getCalendarDays, getJournalTimestamp } = compiled.exports;

test("October 2026 matches the Monday-first reference calendar", () => {
  const days = getCalendarDays(new Date(2026, 9, 1));
  assert.equal(days.length, 35);
  assert.equal(getDateKey(days[0]), "2026-09-28");
  assert.equal(getDateKey(days.at(-1)), "2026-11-01");
  assert.equal(getDateKey(days[22]), "2026-10-20");
});

test("month grids include every date once and end with complete weeks", () => {
  for (let year = 2020; year <= 2030; year++) {
    for (let month = 0; month < 12; month++) {
      const days = getCalendarDays(new Date(year, month, 1));
      assert.equal(days[0].getDay(), 1);
      assert.equal(days.at(-1).getDay(), 0);
      assert.equal(days.length % 7, 0);
      assert.equal(new Set(days.map(getDateKey)).size, days.length);
      const currentMonth = days.filter((day) => day.getMonth() === month);
      assert.equal(currentMonth.length, new Date(year, month + 1, 0).getDate());
      assert.equal(currentMonth[0].getDate(), 1);
      assert.equal(currentMonth.at(-1).getDate(), currentMonth.length);
    }
  }
});

test("handles leap years, six-week months, and year boundaries", () => {
  assert.ok(getCalendarDays(new Date(2024, 1, 1)).some((day) => getDateKey(day) === "2024-02-29"));
  assert.equal(getCalendarDays(new Date(2026, 1, 1)).length, 35);
  assert.equal(getCalendarDays(new Date(2021, 1, 1)).length, 28);
  assert.equal(getCalendarDays(new Date(2026, 2, 1)).length, 42);
  assert.equal(getDateKey(getCalendarDays(new Date(2027, 0, 1))[0]), "2026-12-28");
});

test("saving and reading preserve the selected local date across timezones and DST", () => {
  const originalTimezone = process.env.TZ;
  try {
    for (const timezone of ["Asia/Colombo", "America/Los_Angeles", "Pacific/Kiritimati", "America/New_York"]) {
      process.env.TZ = timezone;
      for (const [year, month, day] of [[2026, 9, 20], [2026, 2, 8], [2026, 10, 1], [2026, 11, 31]]) {
        const selected = new Date(year, month, day, 0, 15);
        const saved = getJournalTimestamp(selected);
        assert.equal(getDateKey(new Date(saved)), getDateKey(selected), timezone);
        assert.equal(new Date(saved).getHours(), 12);
      }
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});
