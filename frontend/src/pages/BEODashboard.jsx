import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const BEODashboard = () => {
  const [schools, setSchools] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [schoolStats, setSchoolStats] = useState({});
  const stored = JSON.parse(localStorage.getItem('user_data') || '{}');
  const now = new Date();
  const curMonth = now.getMonth()+1, curYear = now.getFullYear();

  useEffect(() => { fetchSchools(); fetchAlerts(); }, []);

  const fetchSchools = async () => {
    try {
      const res = await axios.get('/api/schools/');
      setSchools(res.data);
      // Fetch stats for each school
      for (const s of res.data) {
        try {
          const sr = await axios.get(`/api/attendance/school/${s.id}/monthly-summary/?month=${curMonth}&year=${curYear}`);
          setSchoolStats(prev => ({...prev, [s.id]: sr.data}));
        } catch {}
      }
    } catch { toast.error('Error fetching schools'); }
  };

  const fetchAlerts = async () => {
    try { const res = await axios.get('/api/reporting/salary-alerts/'); setAlerts(res.data); } catch {}
  };

  const calculateMonthly = async () => {
    try {
      await axios.post('/api/reporting/calculate-monthly/',{month:curMonth,year:curYear});
      toast.success('Monthly calculation completed'); fetchAlerts();
    } catch { toast.error('Error calculating'); }
  };

  const handleHoldSalary = async (tId) => {
    try {
      await axios.post('/api/reporting/hold-salary/', { teacher_id: tId });
      toast.success('Salary held successfully');
      fetchAlerts();
    } catch { toast.error('Error holding salary'); }
  };

  const handleReleaseSalary = async (tId) => {
    try {
      await axios.post('/api/reporting/release-salary/', { teacher_id: tId });
      toast.success('Salary released successfully');
      fetchAlerts();
    } catch { toast.error('Error releasing salary'); }
  };

  const pctClr = (p) => p>=80?'text-gov-green':p>=60?'text-amber-600':'text-gov-red';
  const barClr = (p) => p>=80?'progress-good':p>=60?'progress-medium':'progress-poor';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* BEO Header */}
      <div className="gov-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden border-2 border-gov-navy/20">
              {stored.photo ? (
                <img src={stored.photo} alt="BEO" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
              ) : null}
              <div className="avatar-placeholder w-full h-full text-xl items-center justify-center bg-gov-navy text-white" style={{display: stored.photo ? 'none' : 'flex'}}>RP</div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gov-navy">Block Education Office, Shirpur</h1>
              <p className="text-sm text-slate-500">{stored.full_name || 'Block Education Officer'} — Dhule District, Maharashtra</p>
              <p className="text-xs text-slate-400">📞 {stored.phone || '02562-233100'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchSchools} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-gov-navy transition-colors" title="Refresh data">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <button onClick={calculateMonthly} className="btn-saffron">📊 Calculate {MONTHS[curMonth]} Attendance</button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card"><div className="stat-label">Schools</div><div className="stat-value">{schools.length}</div></div>
        <div className="stat-card"><div className="stat-label">Total Teachers</div><div className="stat-value">{schools.reduce((a,s)=>{const st=schoolStats[s.id]; return a+(st?.total_teachers||0);},0)}</div></div>
        <div className="stat-card"><div className="stat-label">Avg Attendance</div><div className="stat-value">{schools.length>0?Math.round(Object.values(schoolStats).reduce((a,s)=>a+(s?.average_attendance||0),0)/Math.max(Object.keys(schoolStats).length,1))+'%':'—'}</div></div>
        <div className="stat-card"><div className="stat-label">Salary Alerts</div><div className="stat-value text-gov-red">{alerts.length}</div></div>
      </div>

      {/* Schools Grid */}
      <div>
        <h2 className="section-title">Schools Under Jurisdiction</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map(s => {
            const stats = schoolStats[s.id];
            const avgPct = stats?.average_attendance || 0;
            return (
              <Link to={`/beo/school/${s.id}`} key={s.id} className="gov-card p-5 hover:border-gov-navy/30 group">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-slate-100">
                    {s.logo ? (
                      <img src={s.logo} alt="School" className="w-full h-full object-contain" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    ) : null}
                    <div className="logo-placeholder w-full h-full text-xl items-center justify-center bg-slate-50" style={{display: s.logo ? 'none' : 'flex'}}>🏫</div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gov-navy group-hover:text-gov-saffron transition-colors">{s.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{s.address || 'Address not available'}</p>
                    {s.map_link && <span className="map-link text-[10px]">📍 Map</span>}
                  </div>
                </div>

                {/* Headmaster */}
                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-slate-50">
                  <div className="avatar-placeholder w-8 h-8 text-xs">{s.headmaster_name?.[0]||'H'}</div>
                  <div>
                    <div className="text-xs font-semibold">{s.headmaster_name||'—'}</div>
                    <div className="text-[10px] text-slate-400">Headmaster • {s.headmaster_phone||'—'}</div>
                  </div>
                </div>

                {/* Monthly Stats */}
                {stats && <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">{MONTHS[curMonth]} Attendance</span>
                    <span className={`text-sm font-bold ${pctClr(avgPct)}`}>{avgPct}%</span>
                  </div>
                  <div className="progress-bar"><div className={`progress-fill ${barClr(avgPct)}`} style={{width:`${avgPct}%`}}/></div>
                  <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                    <span>{stats.total_teachers} teachers</span>
                    <span>{stats.working_days} working days</span>
                  </div>
                </div>}

                <div className="mt-3 text-xs text-gov-navy font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details →
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Salary Alerts */}
      {alerts.length > 0 && <div>
        <h2 className="section-title">⚠️ Salary Block Alerts</h2>
        <div className="gov-card overflow-hidden">
          <table className="gov-table"><thead><tr><th>Teacher</th><th>School</th><th>Class</th><th>Status</th><th className="text-right">Action</th></tr></thead>
            <tbody>{alerts.map(a=><tr key={a.teacher_id}>
              <td><div className="flex items-center gap-2"><div className="avatar-placeholder avatar-sm">{a.teacher?.[0]}</div><span className="font-medium text-sm">{a.teacher}</span></div></td>
              <td className="text-sm">{a.school}</td>
              <td className="text-sm">Std {a.standard}{a.division}</td>
              <td>{a.salary_held?<span className="badge badge-held">🔒 Held</span>:<span className="badge badge-absent">⚠ Recommended</span>}</td>
              <td className="text-right">
                {a.salary_held ? (
                  <button onClick={() => handleReleaseSalary(a.teacher_id)} className="text-xs font-bold text-gov-green hover:underline">Release Salary</button>
                ) : (
                  <button onClick={() => handleHoldSalary(a.teacher_id)} className="text-xs font-bold text-gov-red hover:underline">Hold Salary</button>
                )}
              </td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>}
    </div>
  );
};

export default BEODashboard;