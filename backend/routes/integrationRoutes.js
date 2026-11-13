const express = require("express");
const axios = require("axios");
const { protect, travelerOnly } = require("../middleware/authMiddleware");
const { text, fail } = require("../utils/validation");
const router = express.Router();
router.use(protect, travelerOnly);
const cache = new Map();
const cached = async (key, ttl, load) => {
  const entry = cache.get(key);
  if (entry && entry.until > Date.now()) return entry.data;
  const data = await load();
  if (cache.size >= 300) cache.delete(cache.keys().next().value);
  cache.set(key, { data, until: Date.now() + ttl });
  return data;
};
const upstream = async (load) => {
  try {
    return await load();
  } catch (error) {
    if (error.response?.status === 404)
      fail("No matching location was found", 404);
    fail(
      "This travel service is temporarily unavailable. Please try again later.",
      503,
    );
  }
};
router.get("/locations", async (req, res) => {
  const q = text(req.query.q, "Search", 200, 3);
  const results = await cached(`locations:${q.toLowerCase()}`, 3600000, () =>
    upstream(async () => {
      const { data } = await axios.get("https://photon.komoot.io/api/", {
        params: { q, limit: 5 },
        timeout: 8000,
      });
      return (data.features || [])
        .filter((feature) => feature.properties?.name)
        .map((feature) => ({
          name: feature.properties.name,
          address: [
            feature.properties.city || feature.properties.state,
            feature.properties.country,
          ]
            .filter(Boolean)
            .join(", "),
          country: feature.properties.country || "",
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
        }));
    }),
  );
  res.json(results);
});
router.get("/weather", async (req, res) => {
  const city = text(req.query.city, "City", 200);
  const key = process.env.WEATHER_API_KEY || process.env.VITE_WEATHER_API_KEY;
  if (!key)
    fail("Weather is not configured yet. Your trip can still be saved.", 503);
  const weather = await cached(`weather:${city.toLowerCase()}`, 600000, () =>
    upstream(async () => {
      const { data } = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
          params: { q: city.split(",")[0].trim(), appid: key, units: "metric" },
          timeout: 8000,
        },
      );
      return {
        name: data.name,
        main: { temp: data.main.temp, humidity: data.main.humidity },
        weather: data.weather.map(({ main, description, icon }) => ({
          main,
          description,
          icon,
        })),
        wind: { speed: data.wind?.speed || 0 },
      };
    }),
  );
  res.json(weather);
});
router.get("/photo", async (req, res) => {
  const destination = text(req.query.destination, "Destination", 200);
  const key = process.env.PEXELS_API_KEY || process.env.VITE_PEXELS_API_KEY;
  if (!key) return res.json({ url: null });
  const photo = await cached(
    `photo:${destination.toLowerCase()}`,
    86400000,
    () =>
      upstream(async () => {
        const { data } = await axios.get("https://api.pexels.com/v1/search", {
          headers: { Authorization: key },
          params: { query: destination, per_page: 1 },
          timeout: 8000,
        });
        const item = data.photos?.[0];
        return {
          url: item?.src?.large || null,
          photographer: item?.photographer || "",
          photographerUrl: item?.photographer_url || "",
          sourceUrl: item?.url || "",
        };
      }),
  );
  res.json(photo);
});
module.exports = router;
