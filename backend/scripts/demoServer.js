// A disposable database for demonstrations and browser QA; no real .env is loaded.
const mongoose = require("mongoose");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const User = require("../models/User");
const Trip = require("../models/Trip");
const Checklist = require("../models/Checklist");
const Announcement = require("../models/Announcement");
let database, server;
const stop = async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  if (database) await database.stop();
  process.exit(0);
};
(async () => {
  process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex");
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
  const password = await bcrypt.hash("DemoTravel123!", 10);
  const [traveler, admin] = await User.create([
    { username: "Jamie", email: "traveler@example.test", password },
    { username: "Admin", email: "admin@example.test", password, role: "admin" },
  ]);
  const date = (offset) =>
    new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
  const trip = await Trip.create({
    userId: traveler._id,
    destination: "George Town, Malaysia",
    startDate: date(7),
    endDate: date(10),
    budget: 1800,
    hotel: true,
    flight: true,
    activities: true,
    itinerary: {
      dailyHotels: {
        1: {
          name: "George Town base",
          address: "Penang, Malaysia",
          lat: 5.4141,
          lon: 100.3288,
        },
      },
      days: {
        1: [
          {
            name: "Pinang Peranakan Mansion",
            address: "Church Street, George Town",
            lat: 5.4175,
            lon: 100.3434,
          },
        ],
      },
    },
  });
  await Checklist.create({
    userId: traveler._id,
    tripId: trip._id,
    task: "Confirm hotel check-in",
  });
  await Announcement.create({
    title: "Welcome to TravelWise",
    message: "Your next adventure starts with a little plan.",
    createdBy: admin._id,
  });
  server = require("../app").listen(
    Number(process.env.PORT) || 5000,
    "127.0.0.1",
    () =>
      console.log(
        "Disposable demo ready. Traveler: traveler@example.test; administrator: admin@example.test; demo password: DemoTravel123!",
      ),
  );
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
})().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect();
  if (database) await database.stop();
  process.exitCode = 1;
});
