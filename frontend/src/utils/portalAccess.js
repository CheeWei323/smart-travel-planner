export const portalHome = (role) =>
  role === "admin" ? "/admin" : "/dashboard";

export const loginDestination = (role, requested) => {
  if (
    typeof requested !== "string" ||
    !requested.startsWith("/") ||
    requested.startsWith("//")
  )
    return portalHome(role);
  if (role === "admin")
    return /^\/admin(?:\/|\?|#|$)/.test(requested) ? requested : "/admin";
  return /^\/(?:dashboard|trips|create-trip|profile|feedback|(?:edit-trip|view-trip)\/[^/?#]+|itinerary(?:\/[^/?#]+)?)(?:[?#].*)?$/.test(
    requested,
  )
    ? requested
    : "/dashboard";
};
