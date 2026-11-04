import { test } from "node:test";
import assert from "node:assert/strict";
import { loginDestination, portalHome } from "../src/utils/portalAccess.js";

test("Administrator login always stays in the administration portal", () => {
  assert.equal(portalHome("admin"), "/admin");
  for (const requested of [
    undefined,
    "/dashboard",
    "/create-trip",
    "/itinerary",
    "/trips",
    "/profile",
    "/feedback",
  ])
    assert.equal(loginDestination("admin", requested), "/admin");
  assert.equal(loginDestination("admin", "/admin/users"), "/admin/users");
  assert.equal(
    loginDestination("admin", "/admin?tab=feedback"),
    "/admin?tab=feedback",
  );
  assert.equal(loginDestination("admin", "/admin/settings"), "/admin/settings");
});
test("Travelers keep their own routes and cannot return to an admin bookmark", () => {
  assert.equal(portalHome("user"), "/dashboard");
  assert.equal(loginDestination("user", "/admin"), "/dashboard");
  assert.equal(loginDestination("user", "/admin/trips"), "/dashboard");
  assert.equal(
    loginDestination("user", "/itinerary/trip-id"),
    "/itinerary/trip-id",
  );
  assert.equal(
    loginDestination("user", "/edit-trip/trip-id"),
    "/edit-trip/trip-id",
  );
  assert.equal(loginDestination("user", "/profile"), "/profile");
});
test("Login destinations reject external addresses and unrelated paths", () => {
  for (const role of ["user", "admin"])
    for (const requested of [
      "//example.test",
      "https://example.test",
      "/",
      "/register",
      "/administrator",
      { path: "/admin" },
    ])
      assert.equal(loginDestination(role, requested), portalHome(role));
});
