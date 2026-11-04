import { test } from "node:test";
import assert from "node:assert/strict";
import {
  tripStatus,
  duration,
  dateKey,
  dayDate,
  todayKey,
  money,
} from "../src/utils/dates.js";
import { distance, orderNearby } from "../src/utils/route.js";
test("A trip stays active for its full final calendar day", () => {
  const trip = {
    startDate: "2026-11-03T00:00:00.000Z",
    endDate: "2026-11-04T00:00:00.000Z",
  };
  assert.equal(tripStatus(trip, "2026-11-02"), "Upcoming");
  assert.equal(tripStatus(trip, "2026-11-03"), "Active");
  assert.equal(tripStatus(trip, "2026-11-04"), "Active");
  assert.equal(tripStatus(trip, "2026-11-05"), "Completed");
  assert.equal(todayKey(new Date(2026, 10, 4, 23, 59)), "2026-11-04");
});
test("Day counts and dates handle month and leap-year boundaries", () => {
  const trip = { startDate: "2028-02-28", endDate: "2028-03-01" };
  assert.equal(duration(trip), 3);
  assert.equal(dayDate(trip, 2), "2028-02-29");
  assert.equal(dateKey("2026-11-04T00:00:00.000Z"), "2026-11-04");
  assert.match(money(1200.5), /1,200\.50/);
});
test("Nearby-stop ordering preserves every stop, does not mutate input and respects a starting hotel", () => {
  const start = { lat: 0, lon: 0 };
  const far = { name: "Far", lat: 0, lon: 10 };
  const near = { name: "Near", lat: 0, lon: 1 };
  const middle = { name: "Middle", lat: 0, lon: 3 };
  const original = [far, near, middle];
  assert.deepEqual(orderNearby(start, original), [near, middle, far]);
  assert.deepEqual(original, [far, near, middle]);
  assert.deepEqual(orderNearby(null, original), [far, middle, near]);
  assert.deepEqual(orderNearby(null, []), []);
  assert.equal(distance(start, start), 0);
  assert.ok(
    Number.isFinite(distance({ lat: 90, lon: 0 }, { lat: -90, lon: 180 })),
  );
});
