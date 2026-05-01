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
      <div className="p-4 bg-yellow-100 rounded">
        <p>GPS not available. Enter location manually:</p>
        <input
          type="number"
          placeholder="Latitude"
          value={location.lat}
          onChange={(e) => setLocation({ ...location, lat: e.target.value })}
          className="block w-full mt-2 p-2 border"
        />
        <input
          type="number"
          placeholder="Longitude"
          value={location.lon}
          onChange={(e) => setLocation({ ...location, lon: e.target.value })}
          className="block w-full mt-2 p-2 border"
        />
        <button onClick={handleManual} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
      </div>
    );
  }

  return <p>Getting location...</p>;
};

export default GeoLocationPrompt;