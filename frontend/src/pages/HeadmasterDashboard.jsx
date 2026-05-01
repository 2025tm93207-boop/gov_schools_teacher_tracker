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
      setTeachers(res.data.teachers || []);
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
    <div className="mx-auto w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Headmaster Dashboard</h1>
          <p className="mt-2 text-slate-600">Manage today’s attendance session and review teacher status.</p>
        </div>
        <button onClick={startSession} className="rounded-lg bg-saffron-600 px-5 py-3 text-white transition hover:bg-saffron-700">Start Attendance Session</button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Today's Attendance</h2>
        <div className="grid gap-4">
          {teachers.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-slate-700">No attendance records available yet.</div>
          ) : (
            teachers.map((t) => (
              <div key={t.teacher} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                <span className="font-medium text-slate-900">{t.teacher}</span>
                <span className={
                  t.status === 'Present'
                    ? 'text-emerald-600'
                    : t.status === 'Partial'
                      ? 'text-amber-600'
                      : 'text-rose-600'
                }>{t.status}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HeadmasterDashboard;