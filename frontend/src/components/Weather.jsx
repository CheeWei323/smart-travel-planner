import { useState, useEffect } from 'react';
import { getWeatherByCity } from '../services/weatherService';
import { FaMapMarkerAlt, FaWind, FaTint } from "react-icons/fa";

// 🔥 NEW: Function to pick a gradient based on the weather condition
const getBackgroundGradient = (weatherMain) => {
  switch (weatherMain) {
    case 'Clear':
      return "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"; // Bright Blue
    case 'Clouds':
      return "linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)"; // Overcast Grey
    case 'Rain':
    case 'Drizzle':
      return "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)"; // Rainy Dark Blue/Purple
    case 'Thunderstorm':
      return "linear-gradient(135deg, #141e30 0%, #243b55 100%)"; // Stormy Dark Grey
    case 'Snow':
      return "linear-gradient(135deg, #83a4d4 0%, #b6fbff 100%)"; // Icy Light Blue
    default:
      return "linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)"; // Fog/Mist/Default Muted Blue
  }
};

export default function Weather({ city }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!city) return;
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const data = await getWeatherByCity(city);
        setWeather(data);
        setError('');
      } catch (err) {
        setError('Could not fetch weather for this location.');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [city]);

  if (loading) {
    return (
      <div style={{ ...containerStyle, background: "#f3f4f6", color: "#6b7280", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "150px" }}>
        Loading weather data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...containerStyle, background: "#fee2e2", color: "#dc2626", border: "1px solid #f87171" }}>
        {error}
      </div>
    );
  }

  if (!weather) return null;

  const temp = Math.round(weather.main.temp);
  const desc = weather.weather[0].description;
  const weatherMain = weather.weather[0].main; // e.g., "Clear", "Rain", "Clouds"
  const iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;
  const humidity = weather.main.humidity;
  const windSpeed = weather.wind ? Math.round(weather.wind.speed * 3.6) : 0; 

  // Determine the dynamic background
  const dynamicBackground = getBackgroundGradient(weatherMain);

  return (
    <div style={{ ...cardStyle, background: dynamicBackground }}>
      {/* Top Header: Location */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <FaMapMarkerAlt size={16} />
        <span style={{ fontSize: "18px", fontWeight: "bold", letterSpacing: "0.5px" }}>
          {weather.name}
        </span>
      </div>

      {/* Main Content: Icon and Big Temperature */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img 
            src={iconUrl} 
            alt={desc} 
            style={{ width: "120px", height: "120px", marginTop: "-15px", filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.2))" }} 
          />
          <span style={{ textTransform: "capitalize", fontSize: "16px", fontWeight: "500", marginTop: "-20px" }}>
            {desc}
          </span>
        </div>

        <div style={{ fontSize: "72px", fontWeight: "bold", lineHeight: "1", textShadow: "2px 4px 8px rgba(0,0,0,0.2)" }}>
          {temp}°
        </div>
      </div>

      {/* Bottom Footer: Extra Stats */}
      <div style={{ 
        display: "flex", 
        gap: "20px", 
        marginTop: "20px", 
        background: "rgba(255, 255, 255, 0.2)", 
        padding: "12px 20px", 
        borderRadius: "16px",
        backdropFilter: "blur(10px)" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
          <FaWind size={20} opacity={0.9} />
          <div>
            <div style={{ fontSize: "12px", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }}>Wind</div>
            <div style={{ fontWeight: "bold", fontSize: "15px" }}>{windSpeed} km/h</div>
          </div>
        </div>
        
        <div style={{ width: "1px", background: "rgba(255,255,255,0.3)" }}></div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, paddingLeft: "10px" }}>
          <FaTint size={20} opacity={0.9} />
          <div>
            <div style={{ fontSize: "12px", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }}>Humidity</div>
            <div style={{ fontWeight: "bold", fontSize: "15px" }}>{humidity}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// STYLES
const containerStyle = {
  padding: "20px",
  borderRadius: "20px",
  maxWidth: "400px",
  fontFamily: "Arial, sans-serif",
};

const cardStyle = {
  ...containerStyle,
  color: "white",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)", // Toned down the shadow slightly so it looks good on all colors
  transition: "background 0.5s ease-in-out", // Smooth transition if the weather updates
};