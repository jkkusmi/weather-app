import React, { useState } from 'react';
import './App.css';

interface WeatherDetails {
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
}

interface LocationData {
  id: number;
  city: string;
  temp: number;
  condition: string;
  icon: string;
  isFavorite: boolean;
}

const CURRENT_WEATHER = {
  city: "Wrocław",
  temp: 17,
  condition: "Partly Cloudy",
  icon: "⛅️",
  details: {
    humidity: 79,
    windSpeed: 10,
    feelsLike: 11,
    pressure: 1015,
    uvIndex: .8,
    visibility: 24
  } as WeatherDetails
};

const SAVED_LOCATIONS: LocationData[] = [
  { id: 1, city: "Warsaw", temp: 11, condition: "Rainy", icon: "🌧️", isFavorite: true },
  { id: 2, city: "Tokyo", temp: 13, condition: "Sunny", icon: "☀️", isFavorite: false },
  { id: 3, city: "New York", temp: 3, condition: "Cloudy", icon: "☁️", isFavorite: false },
  { id: 4, city: "Sydney", temp: 28, condition: "Clear", icon: "☀️", isFavorite: false },
];

const App: React.FC = () => {
  const [locations, setLocations] = useState<LocationData[]>(SAVED_LOCATIONS);

  const toggleFavorite = (id: number) => {
    setLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, isFavorite: !loc.isFavorite } : loc
    ));
  };

  const scrollToDetails = () => {
    const detailsSection = document.getElementById('details-section');
    detailsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      
      <section className="hero-section">
        <div className="hero-content">
          <h2 className="location-title">{CURRENT_WEATHER.city}</h2>
          <div className="weather-icon">{CURRENT_WEATHER.icon}</div>
          <h1 className="main-temp">{CURRENT_WEATHER.temp}°</h1>
          <p className="weather-desc">{CURRENT_WEATHER.condition}</p>
        </div>
        
        <div className="scroll-indicator" onClick={scrollToDetails}>
          ⌄
        </div>
      </section>

      <section id="details-section">
        <div className="glass-panel">
          <div className="panel-header">
            <h3>Current Conditions</h3>
          </div>
          <div className="details-grid">
            <DetailItem label="Feels Like" value={`${CURRENT_WEATHER.details.feelsLike}°`} />
            <DetailItem label="Humidity" value={`${CURRENT_WEATHER.details.humidity}%`} />
            <DetailItem label="Wind" value={`${CURRENT_WEATHER.details.windSpeed} mph`} />
            <DetailItem label="UV Index" value={`${CURRENT_WEATHER.details.uvIndex}`} />
            <DetailItem label="Pressure" value={`${CURRENT_WEATHER.details.pressure} hPa`} />
            <DetailItem label="Visibility" value={`${CURRENT_WEATHER.details.visibility} km`} />
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: '2rem', fontWeight: 300 }}>Saved Locations</h2>
        <div className="locations-grid">
          {locations.map((loc) => (
            <div key={loc.id} className="location-card">
              <div>
                <h3>{loc.city}</h3>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{loc.condition}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="card-temp">{loc.temp}°</span>
                <span>{loc.icon}</span>
                <button 
                  className={`fav-btn ${loc.isFavorite ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(loc.id);
                  }}
                >
                  ★
                </button>
              </div>
            </div>
          ))}
          
          <div className="location-card" style={{ justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.3)', background: 'transparent' }}>
            <span>+ Add Location</span>
          </div>
        </div>
      </section>

    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="detail-item">
    <span className="label">{label}</span>
    <span className="value">{value}</span>
  </div>
);

export default App;