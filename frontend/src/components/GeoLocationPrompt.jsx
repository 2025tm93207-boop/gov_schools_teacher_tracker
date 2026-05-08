import { useState, useEffect } from 'react';

const GeoLocationPrompt = ({ onLocation }) => {
  const [status, setStatus] = useState('requesting'); // 'requesting', 'success', 'denied', 'error'

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setStatus('success');
          onLocation(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          if (err.code === 1) setStatus('denied');
          else setStatus('error');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setStatus('error');
    }
  }, [onLocation]);

  if (status === 'denied') {
    return (
      <div className="rounded-xl border border-gov-red bg-red-50 p-4 text-gov-red">
        <p className="font-bold">📍 Location Access Denied</p>
        <p className="text-sm mt-1">Manual entry is not allowed. Please enable location permissions in your browser settings to mark attendance.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-xl border border-gov-red bg-red-50 p-4 text-gov-red">
        <p className="font-bold">❌ GPS Error</p>
        <p className="text-sm mt-1">Could not retrieve your location. Please ensure your device's GPS is turned on and try again.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-gov-green bg-green-50 p-4 text-gov-green">
        <p className="font-bold">✅ Location Verified</p>
        <p className="text-sm mt-1">Your coordinates have been captured automatically.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
      <div className="w-5 h-5 border-2 border-gov-navy border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-700 font-medium">Getting location from the browser...</p>
    </div>
  );
};

export default GeoLocationPrompt;