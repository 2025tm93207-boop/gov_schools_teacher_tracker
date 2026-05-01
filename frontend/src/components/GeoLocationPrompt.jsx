import { useState, useEffect } from 'react';

const GeoLocationPrompt = ({ onLocation }) => {
  const [location, setLocation] = useState({ lat: '', lon: '' });
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          onLocation(pos.coords.latitude, pos.coords.longitude);
        },
        () => setManual(true)
      );
    } else {
      setManual(true);
    }
  }, [onLocation]);

  const handleManual = () => {
    onLocation(parseFloat(location.lat), parseFloat(location.lon));
  };

  if (manual) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-slate-800 font-medium">GPS not available. Enter location manually:</p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-sm text-slate-700 mb-1">Latitude</label>
            <input
              type="number"
              placeholder="Latitude"
              value={location.lat}
              onChange={(e) => setLocation({ ...location, lat: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Longitude</label>
            <input
              type="number"
              placeholder="Longitude"
              value={location.lon}
              onChange={(e) => setLocation({ ...location, lon: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900"
            />
          </div>
          <button onClick={handleManual} className="w-full rounded-lg bg-saffron-600 px-4 py-3 text-slate-900 font-semibold transition hover:bg-saffron-700">Submit Location</button>
          <p className="text-sm text-slate-600">For laptop demo, you may use school coordinates in the input fields.</p>
        </div>
      </div>
    );
  }

  return <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">Getting location from the browser...</p>;
};

export default GeoLocationPrompt;