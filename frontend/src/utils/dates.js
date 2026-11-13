export const dateKey = (value) => (value ? String(value).slice(0, 10) : "");
export const todayKey = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
export const tripStatus = (trip, today = todayKey()) =>
  dateKey(trip.startDate) > today
    ? "Upcoming"
    : dateKey(trip.endDate) < today
      ? "Completed"
      : "Active";
export const formatDate = (value) =>
  value
    ? new Date(`${dateKey(value)}T12:00:00`).toLocaleDateString("en-MY", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
export const duration = (trip) =>
  Math.round(
    (Date.parse(dateKey(trip.endDate)) - Date.parse(dateKey(trip.startDate))) /
      86400000,
  ) + 1;
export const dayDate = (trip, day) =>
  new Date(Date.parse(dateKey(trip.startDate)) + (day - 1) * 86400000)
    .toISOString()
    .slice(0, 10);
export const money = (value) =>
  new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(
    Number(value) || 0,
  );
