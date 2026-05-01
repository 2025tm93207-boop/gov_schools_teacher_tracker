import { useState, useEffect } from 'react';
import axios from 'axios';

const PublicDashboard = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await axios.get('/api/public/schools/');
      setSchools(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async (schoolId) => {
    try {
      const res = await axios.get(`/api/public/school/${schoolId}/today/`);
      setData(res.data);
    } catch (err) {
      setData(null);
    }
  };

  const handleSelect = (schoolId) => {
    setSelectedSchool(schoolId);
    fetchData(schoolId);
  };

  return (
    <div className="mx-auto w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-slate-900">Public Attendance Dashboard</h1>
        <p className="mt-2 text-slate-600">View today’s teacher attendance status for each ZPPS school.</p>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select School</label>
        <select onChange={(e) => handleSelect(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-saffron-600 focus:outline-none focus:ring-2 focus:ring-saffron-100">
          <option value="">Select School</option>
          {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      {data && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-4 sm:grid-cols-3 mb-6 text-slate-900">
            <div className="rounded-lg bg-white p-4 shadow-sm">Total Teachers<br /><span className="text-2xl font-semibold">{data.total_teachers}</span></div>
            <div className="rounded-lg bg-white p-4 shadow-sm">Signed In<br /><span className="text-2xl font-semibold">{data.signed_in}</span></div>
            <div className="rounded-lg bg-white p-4 shadow-sm">Not Signed In<br /><span className="text-2xl font-semibold">{data.not_signed_in}</span></div>
          </div>
          <div className="space-y-3">
            {data.teachers.map((t) => (
              <div key={t.teacher} className="flex items-center justify-between rounded-lg bg-white p-4 text-slate-900">
                <span>{t.teacher}</span>
                <span className={
                  t.status === 'Present' ? 'text-emerald-600' : t.status === 'Partial' ? 'text-amber-600' : 'text-rose-600'
                }>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicDashboard;