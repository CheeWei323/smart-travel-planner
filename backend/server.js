require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const connectDB = require("./config/db");
const start = async () => {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET)
    throw new Error(
      "Set MONGO_URI and JWT_SECRET in backend/.env before starting the server",
    );
  await connectDB();
  const app = require("./app");
  const port = Number(process.env.PORT) || 5000;
  return app.listen(port, () =>
    console.log(`TravelWise API listening on port ${port}`),
  );
};
if (require.main === module)
  start().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
module.exports = start;
