import { useState } from "react";

interface WeatherData {
  date: number;
  maxTempCelsius: number;
  minTempCelsius: number;
  avgTempCelsius: number;
  precipitationMm: number;
}

export function RegionWeather() {
  const [region, setRegion] = useState("Dunántúl");
  const [startDate, setStartDate] = useState("19010101");
  const [endDate, setEndDate] = useState("19010131");
  const [data, setData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regions = ["Dunántúl", "Közép-Magyarország", "Észak és Alföld"];

  const fetchRegionWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/weather/region?region=${encodeURIComponent(region)}&start=${startDate}&end=${endDate}`
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const result = await response.json() as {
        data: WeatherData[];
        unit: { temperature: string; precipitation: string };
      };
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ismeretlen hiba");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("hu-HU");
  };

  const TO_FAHRENHEIT = (c: number): number => (c * 9) / 5 + 32;
  const MM_TO_INCH = (mm: number): number => mm / 25.4;
  const [isMetric, setIsMetric] = useState(true);
  const getTempLabel = (): string => (isMetric ? "°C" : "°F");
  const getPrecipitationLabel = (): string => (isMetric ? " mm" : " in");
  const convertTemp = (c: number): number =>
  isMetric ? c : Number(TO_FAHRENHEIT(c).toFixed(1));
  const convertPrecipitation = (mm: number): number =>
  isMetric ? mm : Number(MM_TO_INCH(mm).toFixed(3));


  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Régió átlagolt időjárása
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-white rounded-xl shadow-lg">
        <div>
          <label className="block text-sm font-medium mb-2">Régió</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Kezdő dátum (YYYYMMDD)
          </label>
          <input
            type="text"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="19010101"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Befejező dátum (YYYYMMDD)
          </label>
          <input
            type="text"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="19010131"
          />
        </div>
      </div>
       <div className="mb-6 p-4 bg-blue-50 rounded-xl">
        <span className="text-sm text-gray-700 mr-4">
          Mértékegység: <strong>{isMetric ? "SI (°C, mm)" : "Angolszász (°F, in)"}</strong>
        </span>
        <button
          onClick={() => setIsMetric((v) => !v)}
          className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          {isMetric ? "Angolszász →" : "SI →"}
        </button>
      </div>
      <button
        onClick={fetchRegionWeather}
        disabled={loading}
        className="w-full md:w-auto px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 shadow-lg mb-8"
      >
        {loading ? "Betöltés..." : "Átlagok lekérése"}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {data.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <th className="p-4 text-left font-bold">Dátum</th>
                <th className="p-4 text-left font-bold">Max. (°C)</th>
                <th className="p-4 text-left font-bold">Min. (°C)</th>
                <th className="p-4 text-left font-bold">Átl. (°C)</th>
                <th className="p-4 text-left font-bold">Csap. (mm)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{formatDate(row.date)}</td>
                  <td className="p-4">
                    {convertTemp(row.maxTempCelsius).toFixed(1)}
                    <span className="text-sm ml-0.5">{getTempLabel()}</span>
                  </td>
                  <td className="p-4">
                    {convertTemp(row.minTempCelsius).toFixed(1)}
                    <span className="text-sm ml-0.5">{getTempLabel()}</span>
                  </td>
                  <td className="p-4 font-semibold">
                    {convertTemp(row.avgTempCelsius).toFixed(1)}
                    <span className="text-sm ml-0.5">{getTempLabel()}</span>
                  </td>
                  <td className="p-4">
                    {convertPrecipitation(row.precipitationMm).toFixed(3)}
                    <span className="text-sm ml-0.5">{getPrecipitationLabel()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
