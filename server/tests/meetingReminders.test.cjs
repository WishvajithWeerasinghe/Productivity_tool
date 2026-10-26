const assert = require("node:assert/strict");
const { test } = require("node:test");
const MeetingNote = require("../dist/models/MeetingNote").default;
const { createMeetingNote, updateMeetingTime } = require("../dist/controllers/meetingNoteController");

const userId = "507f1f77bcf86cd799439011";
const id = "507f1f77bcf86cd799439012";
const payload = { title: "Planning", meetingDate: "2026-10-20", meetingTime: "10:00", meetingType: "Team Meeting", notes: "Review the plan" };
function response() {
  return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

test("creating a meeting stores its time and still accepts legacy date-only requests", async () => {
  const original = MeetingNote.create;
  const created = [];
  MeetingNote.create = async (note) => { created.push(note); return note; };
  try {
    const res = response();
    await createMeetingNote({ userId, body: payload }, res);
    assert.equal(res.statusCode, 201);
    assert.equal(created[0].meetingTime, "10:00");
    const legacy = { ...payload };
    delete legacy.meetingTime;
    const legacyRes = response();
    await createMeetingNote({ userId, body: legacy }, legacyRes);
    assert.equal(legacyRes.statusCode, 201);
  } finally { MeetingNote.create = original; }
});

test("invalid meeting times are rejected before writing to the database", async () => {
  for (const time of ["24:00", "12:60", "9:00", null, 1000, []]) {
    const res = response();
    await createMeetingNote({ userId, body: { ...payload, meetingTime: time } }, res);
    assert.equal(res.statusCode, 400, JSON.stringify(time));
  }
});

test("time updates are scoped to the current user and update only the time", async () => {
  const original = MeetingNote.findOneAndUpdate;
  let received;
  MeetingNote.findOneAndUpdate = async (...args) => { received = args; return { ...payload, meetingTime: "11:30" }; };
  try {
    const res = response();
    await updateMeetingTime({ userId, params: { id }, body: { meetingTime: "11:30", user: "another-user", title: "Changed" } }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(received[0], { _id: id, user: userId });
    assert.deepEqual(received[1], { $set: { meetingTime: "11:30" } });
    assert.equal(received[2].runValidators, true);
  } finally { MeetingNote.findOneAndUpdate = original; }
});

test("an inaccessible meeting returns 404 and invalid updates return 400", async () => {
  const original = MeetingNote.findOneAndUpdate;
  MeetingNote.findOneAndUpdate = async () => null;
  try {
    const missing = response();
    await updateMeetingTime({ userId, params: { id }, body: { meetingTime: "10:00" } }, missing);
    assert.equal(missing.statusCode, 404);
    const invalid = response();
    await updateMeetingTime({ userId, params: { id: "invalid" }, body: { meetingTime: "10:00" } }, invalid);
    assert.equal(invalid.statusCode, 400);
    const noTime = response();
    await updateMeetingTime({ userId, params: { id }, body: {} }, noTime);
    assert.equal(noTime.statusCode, 400);
  } finally { MeetingNote.findOneAndUpdate = original; }
});

test("the meeting schema validates time and keeps existing untimed meetings valid", () => {
  assert.equal(new MeetingNote({ ...payload, user: userId }).validateSync(), undefined);
  const legacy = new MeetingNote({ ...payload, meetingTime: undefined, user: userId });
  assert.equal(legacy.validateSync(), undefined);
  assert.equal(legacy.meetingTime, "");
  assert.ok(new MeetingNote({ ...payload, meetingTime: "25:90", user: userId }).validateSync().errors.meetingTime);
});
