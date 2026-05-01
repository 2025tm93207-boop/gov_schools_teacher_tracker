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

  if (!session) return <div className="p-4">No active session</div>;

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Teacher Attendance</h1>
      <div className="mb-4">
        <p>Ensure at least 5 students are visible in the frame.</p>
        <WebcamCapture onCapture={setSelfie} />
      </div>
      <GeoLocationPrompt onLocation={(lat, lon) => { setLat(lat); setLon(lon); }} />
      {!signedIn ? (
        <button onClick={handleSignIn} className="w-full bg-blue-500 text-white p-2 rounded mt-4">Sign In</button>
      ) : (
        <button onClick={handleSignOut} className="w-full bg-red-500 text-white p-2 rounded mt-4">Sign Out</button>
      )}
    </div>
  );
};

export default TeacherAttendance;