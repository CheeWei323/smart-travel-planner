export const distance = (a, b) => {
  const radians = (value) => (value * Math.PI) / 180;
  const x =
    Math.sin(radians(b.lat - a.lat) / 2) ** 2 +
    Math.cos(radians(a.lat)) *
      Math.cos(radians(b.lat)) *
      Math.sin(radians(b.lon - a.lon) / 2) ** 2;
  return (
    6371 *
    2 *
    Math.atan2(Math.sqrt(Math.min(1, x)), Math.sqrt(Math.max(0, 1 - x)))
  );
};
export const orderNearby = (start, locations) => {
  const remaining = [...locations];
  const result = [];
  let current = start || remaining.shift();
  if (!start && current) result.push(current);
  while (remaining.length) {
    let index = 0;
    remaining.forEach((item, position) => {
      if (distance(current, item) < distance(current, remaining[index]))
        index = position;
    });
    current = remaining.splice(index, 1)[0];
    result.push(current);
  }
  return result;
};
