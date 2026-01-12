import axios from "axios";
import { OPENWEATHERMAP_API_KEY } from './config.ts';

type WeatherResponse = {
  name: string;
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
  sys?: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone?: number;
  id?: number;
  cod?: number;
};

export interface MainWeather {
  city: string;
  tempC: number;
  feelsLikeC: number;
  minC: number;
  maxC: number;
  humidity: number;
  pressure: number;
  windSpeed: number; // m/s
  windDir: string;
  description: string;
  icon: string;
  clouds: number;
  visiblity: number;
}

export interface MiniWeather {
  city: string;
  description: string;
  tempC: number;
  icon: string;
}

const API_KEY = OPENWEATHERMAP_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

//helper funcs

const kToC = (k: number) => Math.round((k - 273.15) * 10) / 10;

const getWindDirection = (deg: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
};

const mapIcon = (iconCode: string): string => {
  const mapping: { [key: string]: string } = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅️', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '🌩️', '11n': '🌩️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return mapping[iconCode] || '❓';
};

//end section

export class WeatherService {
  private static async fetch(city: string): Promise<WeatherResponse> {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&APPID=${API_KEY}`;
    const res = await axios.get<WeatherResponse>(url);
    return res.data;
  }

  static async getMain(city: string): Promise<MainWeather> {
    const d = await this.fetch(city);

    return {
      city: d.name,
      tempC: kToC(d.main.temp),
      feelsLikeC: kToC(d.main.feels_like),
      minC: kToC(d.main.temp_min),
      maxC: kToC(d.main.temp_max),
      humidity: d.main.humidity,
      pressure: d.main.pressure,
      windSpeed: Math.round(d.wind.speed),
      windDir: getWindDirection(d.wind.deg),
      description: d.weather[0].description,
      icon: mapIcon(d.weather[0].icon),
      clouds: d.clouds.all,
      visiblity: d.visibility
    };
  }

  static async getMini(city: string): Promise<MiniWeather> {
    const d = await this.fetch(city);

    return {
      city: d.name,
      description: d.weather[0].description,
      tempC: kToC(d.main.temp),
      icon: mapIcon(d.weather[0].icon),
    };
  }

  static async getMiniList(cities: string[]): Promise<MiniWeather[]> {
    return Promise.all(cities.map(c => this.getMini(c)));
  }
}
