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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Public Attendance Dashboard</h1>
      <select onChange={(e) => handleSelect(e.target.value)} className="p-2 border mb-4">
        <option>Select School</option>
        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      {data && (
        <div className="bg-white p-4 rounded shadow">
          <p>Total Teachers: {data.total_teachers}</p>
          <p>Signed In: {data.signed_in}</p>
          <p>Not Signed In: {data.not_signed_in}</p>
          <ul className="mt-4 space-y-1">
            {data.teachers.map(t => (
              <li key={t.teacher} className={t.status === 'Present' ? 'text-green-500' : t.status === 'Partial' ? 'text-yellow-500' : 'text-red-500'}>
                {t.teacher}: {t.status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PublicDashboard;