import { useEffect, useState } from "react";
import { getWeatherByCity } from "../services/weatherService";
import { errorMessage } from "../services/api";
import { Loading } from "./UI";
export default function Weather({ city }) {
  const [state, setState] = useState({ city: "", data: null, error: "" });
  useEffect(() => {
    if (!city.trim()) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      getWeatherByCity(city, controller.signal)
        .then((data) => {
          if (!controller.signal.aborted) setState({ city, data, error: "" });
        })
        .catch((failure) => {
          if (!controller.signal.aborted)
            setState({ city, data: null, error: errorMessage(failure) });
        });
    }, 600);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [city]);
  if (!city.trim())
    return (
      <p className="muted">Choose a destination to see current conditions.</p>
    );
  if (state.city !== city) return <Loading>Checking the weather…</Loading>;
  if (state.error)
    return (
      <p className="muted" role="status">
        {state.error}
      </p>
    );
  const weather = state.data;
  return (
    <div className="weather-card">
      <div className="weather-top">
        <div>
          <strong className="temperature">
            {Math.round(weather.main.temp)}°
          </strong>
          <small>
            {weather.name} · {weather.weather[0].description}
          </small>
        </div>
        <img
          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
          alt={weather.weather[0].description}
        />
      </div>
      <div className="weather-metrics">
        <span>Humidity {weather.main.humidity}%</span>
        <span>Wind {Math.round(weather.wind.speed * 3.6)} km/h</span>
      </div>
    </div>
  );
}
