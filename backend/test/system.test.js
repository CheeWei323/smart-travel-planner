const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const User = require("../models/User");
const Trip = require("../models/Trip");
const Checklist = require("../models/Checklist");
const Favorite = require("../models/Favorite");
const Feedback = require("../models/Feedback");
const { provisionAdmin } = require("../scripts/seedAdmin");
process.env.JWT_SECRET = "test-only-secret-not-used-by-any-deployment";
delete process.env.WEATHER_API_KEY;
delete process.env.VITE_WEATHER_API_KEY;
delete process.env.PEXELS_API_KEY;
delete process.env.VITE_PEXELS_API_KEY;
let database, server, base;
before(async () => {
  database = await MongoMemoryReplSet.create({
    binary: {
      downloadDir: require("path").join(
        __dirname,
        "../node_modules/.cache/mongodb",
      ),
    },
    replSet: { count: 1 },
  });
  await mongoose.connect(database.getUri());
  await Promise.all([
    User.init(),
    Trip.init(),
    Checklist.init(),
    Favorite.init(),
    Feedback.init(),
  ]);
  const app = require("../app");
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (database) await database.stop();
});
const request = async (method, url, data, token) => {
  const response = await fetch(`${base}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  });
  return { status: response.status, body: await response.json() };
};
const tripData = {
  destination: "Penang, Malaysia",
  startDate: "2027-02-01",
  endDate: "2027-02-03",
  budget: 1200,
  hotel: true,
  flight: false,
  carRental: false,
  activities: true,
};

test("Complete user and administrator workflows against an isolated database", async (t) => {
  let traveler, stranger, admin, trip, task, favorite, feedback, announcement;
  await t.test(
    "registration, duplicate email, login, current account and invalid credentials",
    async () => {
      for (const [username, email] of [
        ["Traveler", "traveler@example.test"],
        ["Other", "other@example.test"],
      ]) {
        assert.equal(
          (
            await request("POST", "/auth/register", {
              username,
              email,
              password: "Travel123!",
            })
          ).status,
          201,
        );
      }
      assert.equal(
        (
          await request("POST", "/auth/register", {
            username: "Duplicate",
            email: "TRAVELER@example.test",
            password: "Travel123!",
          })
        ).status,
        409,
      );
      traveler = (
        await request("POST", "/auth/login", {
          email: "traveler@example.test",
          password: "Travel123!",
        })
      ).body;
      stranger = (
        await request("POST", "/auth/login", {
          email: "other@example.test",
          password: "Travel123!",
        })
      ).body;
      assert.ok(traveler.token);
      assert.equal(
        (await request("GET", "/auth/me", undefined, traveler.token)).body.user
          .username,
        "Traveler",
      );
      assert.equal(
        (
          await request("POST", "/auth/login", {
            email: "traveler@example.test",
            password: "wrong",
          })
        ).status,
        401,
      );
      assert.equal((await request("GET", "/trips")).status, 401);
      assert.equal(
        (
          await request("POST", "/auth/register", {
            username: "Bad",
            email: { $ne: "" },
            password: "Travel123!",
          })
        ).status,
        400,
      );
    },
  );
  await t.test(
    "administrator bootstrap works and refuses to promote a preexisting ordinary account",
    async () => {
      await assert.rejects(
        provisionAdmin({
          email: "traveler@example.test",
          password: "NewAdmin123!",
        }),
        /ordinary account/,
      );
      assert.equal((await User.findById(traveler.user.id)).role, "user");
      assert.equal(
        (
          await provisionAdmin({
            email: "admin@example.test",
            password: "Admin123!",
            username: "Administrator",
          })
        ).created,
        true,
      );
      assert.equal(
        (
          await provisionAdmin({
            email: "admin@example.test",
            password: "Ignored123!",
          })
        ).created,
        false,
      );
      admin = (
        await request("POST", "/auth/login", {
          email: "admin@example.test",
          password: "Admin123!",
        })
      ).body;
      assert.equal(admin.user.role, "admin");
      assert.equal(
        (await request("GET", "/admin/stats", undefined, traveler.token))
          .status,
        403,
      );
    },
  );
  await t.test(
    "administrators use management endpoints and cannot use personal travel features",
    async () => {
      const examples = [
        ["GET", "/trips"],
        ["POST", "/trips", tripData],
        ["GET", "/trips/111111111111111111111111"],
        ["PUT", "/trips/111111111111111111111111", { budget: 10 }],
        ["DELETE", "/trips/111111111111111111111111"],
        ["GET", "/favorites"],
        ["POST", "/favorites", { destination: "Tokyo" }],
        ["GET", "/checklists/111111111111111111111111"],
        [
          "POST",
          "/checklists",
          { tripId: "111111111111111111111111", task: "Not an admin task" },
        ],
        ["GET", "/feedback/mine"],
        ["GET", "/feedback/announcements"],
        [
          "POST",
          "/feedback",
          { subject: "Personal feedback", message: "Not an admin operation" },
        ],
        ["GET", "/integrations/photo?destination=Penang"],
      ];
      for (const [method, endpoint, body] of examples)
        assert.equal(
          (await request(method, endpoint, body, admin.token)).status,
          403,
          method + " " + endpoint,
        );
      for (const endpoint of [
        "/admin/stats",
        "/admin/users",
        "/admin/trips",
        "/admin/announcements",
        "/admin/feedback",
        "/auth/me",
      ])
        assert.equal(
          (await request("GET", endpoint, undefined, admin.token)).status,
          200,
          endpoint,
        );
      assert.equal(
        (await request("GET", "/trips", undefined, traveler.token)).status,
        200,
      );
    },
  );
  await t.test(
    "trip creation saves checklist tasks atomically and supports list/detail",
    async () => {
      const response = await request(
        "POST",
        "/trips",
        { ...tripData, checklist: ["Pack chargers", "Confirm hotel"] },
        traveler.token,
      );
      assert.equal(response.status, 201, JSON.stringify(response.body));
      trip = response.body;
      assert.equal(
        (await request("GET", "/trips", undefined, traveler.token)).body.length,
        1,
      );
      assert.equal(
        (await request("GET", `/trips/${trip._id}`, undefined, traveler.token))
          .body.budget,
        1200,
      );
      const tasks = (
        await request(
          "GET",
          `/checklists/${trip._id}`,
          undefined,
          traveler.token,
        )
      ).body;
      assert.equal(tasks.length, 2);
      task = tasks[0];
      assert.equal(
        (
          await request(
            "POST",
            "/trips",
            { ...tripData, checklist: [""] },
            traveler.token,
          )
        ).status,
        400,
      );
      assert.equal(await Trip.countDocuments(), 1);
    },
  );
  await t.test(
    "a checklist storage failure rolls back the new trip instead of leaving partial data",
    async () => {
      const beforeTrips = await Trip.countDocuments();
      const beforeTasks = await Checklist.countDocuments();
      await mongoose.connection.db.command({
        collMod: Checklist.collection.collectionName,
        validator: { task: { $ne: "FORCE_CHECKLIST_FAILURE" } },
        validationLevel: "strict",
      });
      try {
        const result = await request(
          "POST",
          "/trips",
          { ...tripData, checklist: ["FORCE_CHECKLIST_FAILURE"] },
          traveler.token,
        );
        assert.equal(result.status, 500);
        assert.equal(await Trip.countDocuments(), beforeTrips);
        assert.equal(await Checklist.countDocuments(), beforeTasks);
      } finally {
        await mongoose.connection.db.command({
          collMod: Checklist.collection.collectionName,
          validator: {},
        });
      }
    },
  );
  await t.test(
    "cross-account access and protected ownership updates are rejected",
    async () => {
      assert.equal(
        (await request("GET", `/trips/${trip._id}`, undefined, stranger.token))
          .status,
        404,
      );
      assert.equal(
        (
          await request(
            "PUT",
            `/trips/${trip._id}`,
            { budget: 2 },
            stranger.token,
          )
        ).status,
        404,
      );
      assert.equal(
        (
          await request(
            "DELETE",
            `/trips/${trip._id}`,
            undefined,
            stranger.token,
          )
        ).status,
        404,
      );
      assert.equal(
        (
          await request(
            "POST",
            "/checklists",
            { tripId: trip._id, task: "Cross-account" },
            stranger.token,
          )
        ).status,
        404,
      );
      assert.equal(
        (
          await request(
            "PUT",
            `/trips/${trip._id}`,
            { $set: { userId: stranger.user.id } },
            traveler.token,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await request(
            "PUT",
            `/checklists/${task._id}`,
            { userId: stranger.user.id },
            traveler.token,
          )
        ).status,
        400,
      );
      assert.equal(
        String((await Trip.findById(trip._id)).userId),
        traveler.user.id,
      );
    },
  );
  await t.test(
    "trip updates validate dates, amount, identifiers and itinerary day boundaries",
    async () => {
      for (const input of [
        { budget: -1 },
        { startDate: "2027-02-31" },
        { endDate: "2027-01-01" },
        { hotel: "false" },
        { itinerary: { days: { 9: [] } } },
      ]) {
        assert.equal(
          (await request("PUT", `/trips/${trip._id}`, input, traveler.token))
            .status,
          400,
        );
      }
      assert.equal(
        (await request("GET", "/trips/not-an-id", undefined, traveler.token))
          .status,
        400,
      );
      assert.equal(
        (
          await request(
            "PUT",
            `/trips/${trip._id}`,
            { budget: 1500.5 },
            traveler.token,
          )
        ).body.budget,
        1500.5,
      );
      assert.equal(
        (
          await request(
            "PUT",
            `/trips/${trip._id}`,
            { endDate: "2027-02-04" },
            traveler.token,
          )
        ).body.endDate.slice(0, 10),
        "2027-02-04",
      );
    },
  );
  await t.test(
    "daily hotels, activity order and empty days persist through reloads and date changes",
    async () => {
      const hotel = {
        name: "Hotel",
        address: "George Town",
        lat: 5.4141,
        lon: 100.3288,
      };
      const one = { name: "Museum", address: "", lat: 5.415, lon: 100.33 };
      const two = { name: "Garden", address: "", lat: 5.42, lon: 100.34 };
      const itinerary = {
        dailyHotels: { 1: hotel },
        days: { 1: [two, one], 4: [one] },
      };
      assert.equal(
        (
          await request(
            "PUT",
            `/trips/${trip._id}`,
            { itinerary },
            traveler.token,
          )
        ).status,
        200,
      );
      const loaded = (
        await request("GET", `/trips/${trip._id}`, undefined, traveler.token)
      ).body;
      assert.equal(loaded.itinerary.days["1"][0].name, "Garden");
      assert.equal(loaded.itinerary.dailyHotels["1"].name, "Hotel");
      const shortened = await request(
        "PUT",
        `/trips/${trip._id}`,
        { endDate: "2027-02-02" },
        traveler.token,
      );
      assert.equal(shortened.status, 200);
      assert.equal(shortened.body.itinerary.days["4"], undefined);
      assert.equal(shortened.body.itinerary.days["1"].length, 2);
    },
  );
  await t.test(
    "checklist add, toggle, rename and delete return consistent outcomes",
    async () => {
      const added = await request(
        "POST",
        "/checklists",
        { tripId: trip._id, task: "Bring adapter" },
        traveler.token,
      );
      assert.equal(added.status, 201);
      assert.equal(
        (
          await request(
            "PUT",
            `/checklists/${added.body._id}`,
            { isCompleted: true, task: "Adapter packed" },
            traveler.token,
          )
        ).body.isCompleted,
        true,
      );
      assert.equal(
        (
          await request(
            "DELETE",
            `/checklists/${added.body._id}`,
            undefined,
            traveler.token,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            "DELETE",
            `/checklists/${added.body._id}`,
            undefined,
            traveler.token,
          )
        ).status,
        404,
      );
    },
  );
  await t.test(
    "favorites support add, case-insensitive duplicate detection and own-list isolation",
    async () => {
      favorite = (
        await request(
          "POST",
          "/favorites",
          { destination: "Tokyo, Japan" },
          traveler.token,
        )
      ).body;
      assert.ok(favorite._id);
      assert.equal(
        (
          await request(
            "POST",
            "/favorites",
            { destination: "tokyo, japan" },
            traveler.token,
          )
        ).status,
        409,
      );
      assert.equal(
        (await request("GET", "/favorites", undefined, stranger.token)).body
          .length,
        0,
      );
      assert.equal(
        (
          await request(
            "DELETE",
            `/favorites/${favorite._id}`,
            undefined,
            stranger.token,
          )
        ).status,
        404,
      );
    },
  );
  await t.test(
    "feedback submission, administrative reply and status are visible to its owner",
    async () => {
      const response = await request(
        "POST",
        "/feedback",
        {
          category: "suggestion",
          subject: "Travel idea",
          message: "Please consider this idea.",
        },
        traveler.token,
      );
      assert.equal(response.status, 201);
      feedback = response.body;
      assert.equal(
        (await request("GET", "/admin/feedback", undefined, admin.token)).body
          .length,
        1,
      );
      assert.equal(
        (
          await request(
            "PUT",
            `/admin/feedback/${feedback._id}`,
            { status: "resolved", adminReply: "Thanks for the idea!" },
            admin.token,
          )
        ).status,
        200,
      );
      const mine = (
        await request("GET", "/feedback/mine", undefined, traveler.token)
      ).body;
      assert.equal(mine[0].status, "resolved");
      assert.equal(mine[0].adminReply, "Thanks for the idea!");
      assert.equal(
        (await request("GET", "/feedback/mine", undefined, stranger.token)).body
          .length,
        0,
      );
    },
  );
  await t.test(
    "announcements can be created, edited, hidden and published",
    async () => {
      announcement = (
        await request(
          "POST",
          "/admin/announcements",
          { title: "Welcome", message: "Enjoy planning.", type: "info" },
          admin.token,
        )
      ).body;
      assert.ok(announcement._id);
      assert.equal(
        (
          await request(
            "GET",
            "/feedback/announcements",
            undefined,
            traveler.token,
          )
        ).body.length,
        1,
      );
      assert.equal(
        (
          await request(
            "PUT",
            `/admin/announcements/${announcement._id}`,
            { isActive: false, title: "Updated welcome" },
            admin.token,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            "GET",
            "/feedback/announcements",
            undefined,
            traveler.token,
          )
        ).body.length,
        0,
      );
      assert.equal(
        (
          await request(
            "PUT",
            `/admin/announcements/${announcement._id}`,
            { isActive: true },
            admin.token,
          )
        ).status,
        200,
      );
    },
  );
  await t.test(
    "admin overview, account search, strict status updates, suspension and role changes work",
    async () => {
      const stats = await request(
        "GET",
        "/admin/stats",
        undefined,
        admin.token,
      );
      assert.equal(stats.status, 200);
      assert.equal(stats.body.totalUsers, 3);
      assert.equal(stats.body.totalTrips, 1);
      assert.equal(
        (
          await request(
            "GET",
            "/admin/users?q=traveler",
            undefined,
            admin.token,
          )
        ).body.length,
        1,
      );
      const accounts = (
        await request("GET", "/admin/users", undefined, admin.token)
      ).body;
      assert.ok(accounts.every((item) => !("password" in item)));
      assert.equal(
        (
          await request(
            "PUT",
            `/admin/users/${stranger.user.id}`,
            { isActive: "false" },
            admin.token,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await request(
            "PUT",
            `/admin/users/${stranger.user.id}`,
            { isActive: false },
            admin.token,
          )
        ).status,
        200,
      );
      assert.equal(
        (await request("GET", "/trips", undefined, stranger.token)).status,
        403,
      );
      await request(
        "PUT",
        `/admin/users/${stranger.user.id}`,
        { isActive: true, role: "admin" },
        admin.token,
      );
      assert.equal(
        (await request("GET", "/admin/stats", undefined, stranger.token))
          .status,
        200,
      );
      await request(
        "PUT",
        `/admin/users/${stranger.user.id}`,
        { role: "user" },
        admin.token,
      );
      assert.equal(
        (await request("GET", "/admin/stats", undefined, stranger.token))
          .status,
        403,
      );
      assert.equal(
        (
          await request(
            "PUT",
            `/admin/users/${admin.user.id}`,
            { role: "user" },
            admin.token,
          )
        ).status,
        400,
      );
    },
  );
  await t.test(
    "profile and password changes persist and reject wrong confirmation",
    async () => {
      const profile = await request(
        "PUT",
        "/auth/profile",
        { username: "Updated Traveler", email: "updated@example.test" },
        traveler.token,
      );
      assert.equal(profile.status, 200);
      assert.equal(profile.body.user.username, "Updated Traveler");
      assert.equal(
        (
          await request(
            "PUT",
            "/auth/profile",
            { currentPassword: "wrong", newPassword: "NewTravel123!" },
            traveler.token,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await request(
            "PUT",
            "/auth/profile",
            { currentPassword: "Travel123!", newPassword: "NewTravel123!" },
            traveler.token,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request("POST", "/auth/login", {
            email: "updated@example.test",
            password: "Travel123!",
          })
        ).status,
        401,
      );
      traveler = (
        await request("POST", "/auth/login", {
          email: "updated@example.test",
          password: "NewTravel123!",
        })
      ).body;
      assert.ok(traveler.token);
    },
  );
  await t.test(
    "optional travel providers fail gracefully without API keys",
    async () => {
      assert.deepEqual(
        (
          await request(
            "GET",
            "/integrations/photo?destination=Penang",
            undefined,
            traveler.token,
          )
        ).body,
        { url: null },
      );
      const weather = await request(
        "GET",
        "/integrations/weather?city=Penang",
        undefined,
        traveler.token,
      );
      assert.equal(weather.status, 503);
      assert.match(weather.body.message, /not configured/);
      assert.equal(
        (
          await request(
            "GET",
            "/integrations/locations?q=x",
            undefined,
            traveler.token,
          )
        ).status,
        400,
      );
    },
  );
  await t.test(
    "ordinary and administrative trip deletion remove their checklists",
    async () => {
      assert.equal(
        (
          await request(
            "DELETE",
            `/trips/${trip._id}`,
            undefined,
            traveler.token,
          )
        ).status,
        200,
      );
      assert.equal(await Checklist.countDocuments({ tripId: trip._id }), 0);
      const created = (
        await request(
          "POST",
          "/trips",
          { ...tripData, checklist: ["Admin cleanup test"] },
          traveler.token,
        )
      ).body;
      assert.equal(
        (await request("GET", "/admin/trips?q=Penang", undefined, admin.token))
          .body.length,
        1,
      );
      assert.equal(
        (
          await request(
            "DELETE",
            `/admin/trips/${created._id}`,
            undefined,
            admin.token,
          )
        ).status,
        200,
      );
      assert.equal(await Checklist.countDocuments({ tripId: created._id }), 0);
    },
  );
  await t.test(
    "account deletion is complete, old access stops and the last admin is protected",
    async () => {
      await request(
        "POST",
        "/trips",
        { ...tripData, checklist: ["Delete with account"] },
        traveler.token,
      );
      assert.equal(
        (
          await request(
            "DELETE",
            "/auth/profile",
            { password: "wrong" },
            traveler.token,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await request(
            "DELETE",
            "/auth/profile",
            { password: "NewTravel123!" },
            traveler.token,
          )
        ).status,
        200,
      );
      for (const model of [Trip, Checklist, Favorite, Feedback])
        assert.equal(
          await model.countDocuments({ userId: traveler.user.id }),
          0,
        );
      assert.equal(
        (await request("GET", "/trips", undefined, traveler.token)).status,
        401,
      );
      assert.equal(
        (
          await request(
            "DELETE",
            `/admin/users/${stranger.user.id}`,
            undefined,
            admin.token,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            "DELETE",
            "/auth/profile",
            { password: "Admin123!" },
            admin.token,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await request(
            "DELETE",
            `/admin/announcements/${announcement._id}`,
            undefined,
            admin.token,
          )
        ).status,
        200,
      );
      assert.equal((await request("GET", "/health")).status, 200);
      assert.equal((await request("GET", "/does-not-exist")).status, 404);
    },
  );
});
