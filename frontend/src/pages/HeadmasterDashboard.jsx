import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const HeadmasterDashboard = () => {
  const [session, setSession] = useState(null);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    fetchToday();
  }, []);

  const fetchToday = async () => {
    try {
      const res = await axios.get(`/api/attendance/school/${localStorage.getItem('school_id')}/today/`);
      setTeachers(res.data.teachers);
    } catch (err) {
      toast.error('Error fetching data');
    }
  };

  const startSession = async () => {
    const now = new Date();
    const data = {
      date: now.toISOString().split('T')[0],
      start_time: now.toTimeString().split(' ')[0],
      end_time: new Date(now.getTime() + 30 * 60000).toTimeString().split(' ')[0],
    };
    try {
      await axios.post('/api/attendance/sessions/', data);
      toast.success('Session started');
      fetchToday();
    } catch (err) {
      toast.error('Error starting session');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Headmaster Dashboard</h1>
      <button onClick={startSession} className="bg-green-500 text-white px-4 py-2 rounded mb-4">Start Attendance Session</button>
      <h2 className="text-xl mb-2">Today's Attendance</h2>
      <ul className="space-y-2">
        {teachers.map(t => (
          <li key={t.teacher} className="p-2 bg-white rounded shadow">
            {t.teacher}: <span className={t.status === 'Present' ? 'text-green-500' : t.status === 'Partial' ? 'text-yellow-500' : 'text-red-500'}>{t.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HeadmasterDashboard;