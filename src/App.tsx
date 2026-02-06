import React, { useState, useEffect, useMemo } from 'react';
import { WeatherService, type MainWeather, type MiniWeather } from "./Weather";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { setMainLocation, removeSavedLocation, toggleTempUnit, addSavedLocation } from "./store/localPreferences";
import './App.css';
import { BrowserRouter } from 'react-router-dom';

const MOCK_FC = [
  { day: "Wed", temp: -2, condition: "Clear", icon: "☀️" },
  { day: "Thu", temp: -7, condition: "Snow", icon: "❄️" },
  { day: "Fri", temp: -5, condition: "Snow", icon: "❄️" },
  { day: "Sat", temp: -4, condition: "Cloudy", icon: "☁️" },
  { day: "Sun", temp: -6, condition: "Sunny", icon: "☀️" },
]

type LocationRow = {
  name: string;
  lat: number;
  lon: number;
  country: string;
};

const parseCSV = (text: string): LocationRow[] => {
  const lines = text.trim().split(/\r?\n/);

  const [, ...rows] = lines;

  return rows
    .map(line => line.split(";"))
    .filter(cols => cols.length >= 4)
    .map(([name, lon, lat, country]) => ({
      name: name.trim(),
      lon: Number(lon.replace(",", ".")),
      lat: Number(lat.replace(",", ".")),
      country: country.trim(),
    }))
    .filter(l => !Number.isNaN(l.lat) && !Number.isNaN(l.lon));
};

//const MAIN_LOCATION = "Wroclaw"
//const SAVED_LOCATIONS = ["Mumbai", "La Paz", "Dubai", "Hanover", "Bergen", "Jalalabad", "Jackpot", "Tehran", "Hokkaido", "Voronezh"]

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { MAIN_LOCATION, SAVED_LOCATIONS, TEMP_UNIT } = useAppSelector(
    s => s.localPreferences
  );

  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [locations, setLocations] = useState<LocationRow[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return locations.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.country.toLowerCase().includes(q)
    );
  }, [query, locations]);

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

  useEffect(() => {
    fetch("/cities_list.csv")
      .then(r => r.text())
      .then(text => setLocations(parseCSV(text)));
  }, []);

  if (!main) return(
  <div className="app-container">
    <div>Loading...</div>
  </div>
  );

  /*
  const toggleFavorite = (id: number) => {
    setLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, isFavorite: !loc.isFavorite } : loc
    ));
  };
  */
  const UpdateBackground = (main: MainWeather | null) => {
    if(main == null) return;
    console.log("Changing background to "+main.background);
    document.documentElement.style.setProperty("--active-background",`var(${main.background})`);
  }

  const scrollToDetails = () => {
    const detailsSection = document.getElementById('details-section');
    detailsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const UpdateLocations = async (_city: string) => {
    const prevMain = MAIN_LOCATION;
    const prevMainData = main;
    const prevMinis = minis;

    try {      
      const [main, minis] = await Promise.all([
        WeatherService.getMain(_city),
        WeatherService.getMiniList(
          [prevMain, ...SAVED_LOCATIONS.filter(c => c !== _city && c !== prevMain)]
        ),
      ]);

      dispatch(setMainLocation(_city));
      setMain(main);
      setMinis(minis);
      UpdateBackground(main)

      document
        .getElementById("hero-section")
        ?.scrollIntoView({ behavior: "smooth" });

      setQuery("");
    }
    catch (err) {
      console.log("Caught an error: "+err)
      setMain(prevMainData);
      setMinis(prevMinis);
    }
  }

  const AddMini = async (city: string) => {
    dispatch(addSavedLocation(city));
    const mini = await WeatherService.getMini(city);
    setMinis(prev => [mini, ...prev]);
    setQuery("");

    const detailsSection = document.getElementById('grid-section');
    detailsSection?.scrollIntoView({ behavior: 'smooth' });
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
            {filtered.map((l) => (
              <div className="result-card" key={`${l.name}-${l.country}`} onClick=
                {
                  () => UpdateLocations(l.name)
                }>
                {l.name}
                <button
                  className={`fav-btn ${(SAVED_LOCATIONS.includes(l.name)) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    return SAVED_LOCATIONS.includes(l.name) ? RemoveMini(l.name) : AddMini(l.name);
                  }}
                >
                  ★
                </button>
              </div>
            ))}
            <div className="result-card" onClick={() => UpdateLocations(query)}>
              Add custom: {query}
              <button
                  className={`fav-btn ${(SAVED_LOCATIONS.includes(query.toLowerCase())) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    return SAVED_LOCATIONS.includes(query.toLowerCase()) ? RemoveMini(query.toLowerCase()) : AddMini(query.toLowerCase());
                  }}
                >
                  ★
                </button>
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

        <section id="grid-section">
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