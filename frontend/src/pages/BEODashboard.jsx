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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">BEO Dashboard</h1>
      <button onClick={calculateMonthly} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">Calculate Monthly Attendance</button>
      <h2 className="text-xl mb-2">Schools</h2>
      <ul className="space-y-2 mb-4">
        {schools.map(s => (
          <li key={s.id} className="p-2 bg-white rounded shadow">{s.name}</li>
        ))}
      </ul>
      <h2 className="text-xl mb-2">Salary Block Alerts</h2>
      <ul className="space-y-2">
        {alerts.map(a => (
          <li key={a.teacher} className="p-2 bg-red-100 rounded shadow">{a.teacher} - {a.school}</li>
        ))}
      </ul>
    </div>
  );
};

export default BEODashboard;