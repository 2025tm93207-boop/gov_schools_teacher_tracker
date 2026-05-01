import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BEODashboard = () => {
  const [schools, setSchools] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchSchools();
    fetchAlerts();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await axios.get('/api/schools/');
      setSchools(res.data);
    } catch (err) {
      toast.error('Error fetching schools');
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('/api/reporting/salary-alerts/');
      setAlerts(res.data);
    } catch (err) {
      toast.error('Error fetching alerts');
    }
  };

  const calculateMonthly = async () => {
    try {
      await axios.post('/api/reporting/calculate-monthly/', { month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      toast.success('Calculated');
      fetchAlerts();
    } catch (err) {
      toast.error('Error calculating');
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">BEO Dashboard</h1>
          <p className="mt-2 text-slate-600">Review school attendance performance and salary hold recommendations.</p>
        </div>
        <button onClick={calculateMonthly} className="rounded-lg bg-saffron-600 px-5 py-3 text-white transition hover:bg-saffron-700">Calculate Monthly Attendance</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Schools</h2>
          <div className="space-y-3">
            {schools.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-slate-700">No schools available.</div>
            ) : (
              schools.map((s) => (
                <div key={s.id} className="rounded-lg border border-slate-200 bg-white p-4 text-slate-900">{s.name}</div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Salary Block Alerts</h2>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-slate-700">No alerts at this time.</div>
            ) : (
              alerts.map((a) => (
                <div key={a.teacher} className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-slate-900">
                  <div className="font-medium">{a.teacher}</div>
                  <div className="text-sm text-slate-600">{a.school}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BEODashboard;