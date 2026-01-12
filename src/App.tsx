import React, { useState, useEffect, useMemo } from 'react';
import { WeatherService, type MainWeather, type MiniWeather } from "./Weather";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setMainLocation, removeSavedLocation, toggleTempUnit } from "./store/localPreferences";
import './App.css';
import { BrowserRouter } from 'react-router-dom';

const MOCK_FC = [
      { day: "Wed", temp: -2, condition: "Clear", icon: "☀️" },
      { day: "Thu", temp: -7, condition: "Snow", icon: "❄️" },
      { day: "Fri", temp: -5, condition: "Snow", icon: "❄️" },
      { day: "Sat", temp: -4, condition: "Cloudy", icon: "☁️" },
      { day: "Sun", temp: -6, condition: "Sunny", icon: "☀️" },
]

//const MAIN_LOCATION = "Wroclaw"
//const SAVED_LOCATIONS = ["Mumbai", "La Paz", "Dubai", "Hanover", "Bergen", "Jalalabad", "Jackpot", "Tehran", "Hokkaido", "Voronezh"]

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { MAIN_LOCATION, SAVED_LOCATIONS, TEMP_UNIT } = useAppSelector(
    s => s.localPreferences
  );

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SAVED_LOCATIONS.filter(c =>
      c.toLowerCase().includes(q)
    );
}, [query, SAVED_LOCATIONS]);

  const showTemp = (c: number) =>
    TEMP_UNIT === "C" ? c : cToF(c);
  const tempUnit = () =>
    TEMP_UNIT === "C" ? 'C' : 'F'
  //const [locations, setLocations] = useState<LocationData[]>(SAVED_LOCATIONS);
  const [main, setMain] = useState<MainWeather | null>(null);
  const [minis, setMinis] = useState<MiniWeather[]>([]);

  useEffect(() => {
    WeatherService.getMain(MAIN_LOCATION).then(setMain);
    WeatherService.getMiniList(SAVED_LOCATIONS).then(setMinis);
  }, []);

  if (!main) return <div>Loading...</div>;
  
  /*
  const toggleFavorite = (id: number) => {
    setLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, isFavorite: !loc.isFavorite } : loc
    ));
  };
  */

  const scrollToDetails = () => {
    const detailsSection = document.getElementById('details-section');
    detailsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const UpdateLocations = async (_city: string) => {
    const prevMain = MAIN_LOCATION;

    dispatch(setMainLocation(_city));

    document
      .getElementById("hero-section")
      ?.scrollIntoView({ behavior: "smooth" });
    
    setQuery("");

    const [main, minis] = await Promise.all([
      WeatherService.getMain(_city),
      WeatherService.getMiniList(
        [prevMain, ...SAVED_LOCATIONS.filter(c => c !== _city && c !== prevMain)]
      ),
    ]);

    setMain(main);
    setMinis(minis);
  }

  const RemoveMini = async (city: string) => {
    dispatch(removeSavedLocation(city));
    setMinis(prev => prev.filter(m => m.city !== city));
  };

  const cToF = (c: number) => Math.round((c * 9) / 5 + 32);

  return (
    <BrowserRouter>
    <div className="app-container">

    <button className="temperature-switch" onClick={
      () => dispatch(toggleTempUnit())
    }>°{tempUnit()}</button>

    <div className="search-container">
      <div className="search-bar">
          <input value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            type="text"
            className="search-input"
            placeholder="Search...">
          </input>
      </div>
      <div className={`results-grid ${query || focused ? "show" : "hide"}`}>
        {filtered.map((city) => (
        <div className="result-card" key={city} onClick=
            {
              () => UpdateLocations(city)
            }>
          {city}
        </div>
        ))}
        <div className="result-card">
          Add new...
        </div>
      </div>
    </div>

      <section id="hero-section">
        <div className="hero-content">
          <h2 className="location-title">{main.city}</h2>
          <div className="weather-icon">{main.icon}</div>
          <h1 className="main-temp">{Math.round(showTemp(main.tempC))}°{tempUnit()}</h1>
          <p className="weather-desc">{main.description}</p>
        </div>
        
        <div className="scroll-indicator" onClick={scrollToDetails}>
          ⌄
        </div>
      </section>

      <section id="details-section">
        <h2>{main.city} - {main.description}</h2>
        <br></br>
        <div className="glass-panel">
          <div className="panel-header">
            <h3>Current Conditions: {main.tempC}°{tempUnit()}</h3>
          </div>
          <div className="details-grid">
            <DetailItem label="Feels Like" value={`${showTemp(main.feelsLikeC)}°${tempUnit()}`} />
            <DetailItem label="Humidity" value={`${main.humidity}%`} />
            <DetailItem label="Wind (m/s)" value={`${main.windSpeed} (${main.windDir})`} />
            <DetailItem label="Clouds" value={`${main.clouds}`} />
            <DetailItem label="Pressure" value={`${main.pressure}`} />
            <DetailItem label="Visibility (km)" value={`${main.visiblity}`} />
          </div>

          <div className="panel-header"><h3>5-Day Forecast</h3></div>
          <div className="forecast-scroll-container">
            <table className="forecast-table">
              <tbody>
                {MOCK_FC.map((day, idx) => (
                  <tr key={idx} className="forecast-row">
                    <td className="fc-day">{day.day}</td>
                    <td className="fc-icon">{day.icon}</td>
                    <td className="fc-cond">{day.condition}</td>
                    <td className="fc-temp">{showTemp(day.temp)}°{tempUnit()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: '2rem', fontWeight: 300 }}>Saved Locations</h2>
        <div className="locations-grid">
          {minis.map((loc) => (
            <div key={loc.city} className="location-card" onClick=
            {
              () => UpdateLocations(loc.city)
            }>
              <div>
                <h3>{loc.city}</h3>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{loc.description}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="card-temp">{Math.round(showTemp(loc.tempC))}°{tempUnit()}</span>
                <span>{loc.icon}</span>
                <button 
                  className={`fav-btn ${'active'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    RemoveMini(loc.city);
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
  </BrowserRouter>
  );
};

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="detail-item">
    <span className="label">{label}</span>
    <span className="value">{value}</span>
  </div>
);

export default App;