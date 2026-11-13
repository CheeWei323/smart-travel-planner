const { fields, text, boolean, date, fail } = require("./validation");
const tripFields = [
  "destination",
  "startDate",
  "endDate",
  "budget",
  "hotel",
  "flight",
  "carRental",
  "activities",
  "itinerary",
];
const dayCount = (start, end) =>
  Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
const location = (value) => {
  fields(value, ["name", "address", "lat", "lon"]);
  const name = text(value.name, "Location name", 300);
  const address = value.address ? text(value.address, "Address", 500) : "";
  if (
    typeof value.lat !== "number" ||
    !Number.isFinite(value.lat) ||
    Math.abs(value.lat) > 90 ||
    typeof value.lon !== "number" ||
    !Number.isFinite(value.lon) ||
    Math.abs(value.lon) > 180
  )
    fail("Location coordinates are invalid");
  return { name, address, lat: value.lat, lon: value.lon };
};
const itinerary = (value, days) => {
  fields(value, ["dailyHotels", "days"]);
  const result = { dailyHotels: {}, days: {} };
  for (const group of ["dailyHotels", "days"]) {
    const entries = value[group] || {};
    if (!entries || typeof entries !== "object" || Array.isArray(entries))
      fail("Invalid itinerary");
    for (const [key, entry] of Object.entries(entries)) {
      if (!/^[1-9]\d*$/.test(key) || Number(key) > days)
        fail("Itinerary day falls outside the trip dates");
      if (group === "dailyHotels") result[group][key] = location(entry);
      else {
        if (!Array.isArray(entry) || entry.length > 50)
          fail("Each day can contain up to 50 activities");
        result[group][key] = entry.map(location);
      }
    }
  }
  return result;
};
const tripInput = (body, existing = null) => {
  fields(body, tripFields);
  const result = {};
  if (body.destination !== undefined || !existing)
    result.destination = text(body.destination, "Destination", 200);
  for (const field of ["startDate", "endDate"]) {
    if (body[field] !== undefined || !existing)
      result[field] = date(
        body[field],
        field === "startDate" ? "Start date" : "End date",
      );
  }
  const start = result.startDate || existing.startDate;
  const end = result.endDate || existing.endDate;
  const days = dayCount(start, end);
  if (days < 1 || days > 366)
    fail("Trip dates must cover between 1 and 366 days");
  if (body.budget !== undefined) {
    if (
      typeof body.budget !== "number" ||
      !Number.isFinite(body.budget) ||
      body.budget < 0 ||
      body.budget > 1e9
    )
      fail("Budget must be between RM 0 and RM 1,000,000,000");
    result.budget = Math.round(body.budget * 100) / 100;
  }
  for (const key of ["hotel", "flight", "carRental", "activities"]) {
    if (body[key] !== undefined) result[key] = boolean(body[key], key);
  }
  if (body.itinerary !== undefined)
    result.itinerary = itinerary(body.itinerary, days);
  else if (
    existing &&
    (body.startDate !== undefined || body.endDate !== undefined)
  ) {
    const previous = existing.toObject({ flattenMaps: true }).itinerary || {};
    result.itinerary = Object.fromEntries(
      ["dailyHotels", "days"].map((group) => [
        group,
        Object.fromEntries(
          Object.entries(previous[group] || {}).filter(
            ([key]) => Number(key) <= days,
          ),
        ),
      ]),
    );
  }
  return result;
};
module.exports = { tripInput, dayCount };
