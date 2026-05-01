import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import WebcamCapture from '../components/WebcamCapture';
import GeoLocationPrompt from '../components/GeoLocationPrompt';

const TeacherAttendance = () => {
  const [session, setSession] = useState(null);
  const [signedIn, setSignedIn] = useState(false);
  const [selfie, setSelfie] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await axios.get('/api/attendance/sessions/today/?school_id=' + localStorage.getItem('school_id'));
      setSession(res.data);
    } catch (err) {
      setSession(null);
    }
  };

  const handleSignIn = async () => {
    if (!selfie || !lat || !lon) {
      toast.error('Capture selfie and location');
      return;
    }
    try {
      await axios.post('/api/attendance/sign-in/', { selfie, lat, lon });
      toast.success('Signed in');
      setSignedIn(true);
    } catch (err) {
      toast.error('Error signing in');
    }
  };

  const handleSignOut = async () => {
    if (!selfie) {
      toast.error('Capture selfie');
      return;
    }
    try {
      await axios.post('/api/attendance/sign-out/', { selfie, lat, lon });
      toast.success('Signed out');
      setSignedIn(false);
    } catch (err) {
      toast.error('Error signing out');
    }
  };

  if (!session) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900 mb-4">Teacher Attendance</h1>
        <p className="text-slate-700">There is no active attendance session for today. Please check with your headmaster.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900">Teacher Attendance</h1>
        <p className="mt-2 text-slate-600">Capture your classroom selfie, confirm location, and sign in or sign out.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Selfie Capture</h2>
            <p className="text-slate-600 mb-4">Ensure at least 5 students are visible in the frame before submitting.</p>
            <WebcamCapture onCapture={setSelfie} />
          </div>
        </div>
        <div className="space-y-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Location Verification</h2>
            <GeoLocationPrompt onLocation={(lat, lon) => { setLat(lat); setLon(lon); }} />
          </div>
          <div className="space-y-3">
            {!signedIn ? (
              <button onClick={handleSignIn} className="w-full rounded-lg bg-saffron-600 px-4 py-3 text-white transition hover:bg-saffron-700">Sign In</button>
            ) : (
              <button onClick={handleSignOut} className="w-full rounded-lg bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-800">Sign Out</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendance;