import { useEffect, useState } from "react";
import { getWeatherByCity } from "../services/weatherService";

export default function Weather({ city }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!city) return;
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const data = await getWeatherByCity(city);
        setWeather(data);
        setError("");
      } catch (err) {
        setError("Could not fetch weather");
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [city]);

  if (loading) return <p>Loading weather...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!weather) return null;

  return (
    <div style={{ background: "#f0f9ff", padding: "12px", borderRadius: "12px" }}>
      <h4>Weather in {weather.name}</h4>
      <p>Temperature: {weather.main.temp}°C</p>
      <p>Weather: {weather.weather[0].description}</p>
      <p>Humidity: {weather.main.humidity}%</p>
    </div>
  );
}