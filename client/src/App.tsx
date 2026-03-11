// client/src/App.tsx
import { CityWeather } from "./CityWeather";
import { RegionWeather } from "./RegionWeather";
import { Link, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex space-x-8 font-semibold">
            <Link
              to="/city"
              className="text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-all"
            >
              Város időjárása
            </Link>
            <Link
              to="/region"
              className="text-green-600 hover:text-green-800 px-3 py-2 rounded-lg hover:bg-green-50 transition-all"
            >
              Régió átlagok
            </Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/city" element={<CityWeather />} />
        <Route path="/region" element={<RegionWeather />} />
        <Route path="/" element={<CityWeather />} />
      </Routes>
    </div>
  );
}

export default App;
