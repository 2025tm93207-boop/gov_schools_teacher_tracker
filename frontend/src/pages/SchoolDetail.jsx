import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const SchoolDetail = () => {
  const { id } = useParams();
  const [school, setSchool] = useState(null);
  const [curStats, setCurStats] = useState(null);
  const [prevStats, setPrevStats] = useState(null);
  const [activeMonth, setActiveMonth] = useState('current');
  const now = new Date();
  const curM = now.getMonth()+1, curY = now.getFullYear();
  const prevM = curM===1?12:curM-1, prevY = curM===1?curY-1:curY;

  useEffect(() => {
    fetchSchool(); fetchStats(curM,curY,setCurStats); fetchStats(prevM,prevY,setPrevStats);
  }, []);

  const fetchSchool = async () => {
    try { const res = await axios.get(`/api/schools/${id}/`); setSchool(res.data); } catch {}
  };

  const fetchStats = async (m,y,setter) => {
    try { const res = await axios.get(`/api/reporting/school/${id}/stats/?month=${m}&year=${y}`); setter(res.data); } catch {}
  };

  const holdSalary = async (teacherId, name) => {
    try { await axios.post('/api/reporting/hold-salary/',{teacher_id:teacherId}); toast.success(`Salary held for ${name}`); fetchStats(curM,curY,setCurStats); } catch { toast.error('Error'); }
  };

  const releaseSalary = async (teacherId, name) => {
    try { await axios.post('/api/reporting/release-salary/',{teacher_id:teacherId}); toast.success(`Salary released for ${name}`); fetchStats(curM,curY,setCurStats); } catch { toast.error('Error'); }
  };

  const pctClr = (p) => p>=80?'text-gov-green':p>=60?'text-amber-600':'text-gov-red';
  const barClr = (p) => p>=80?'progress-good':p>=60?'progress-medium':'progress-poor';
  const rowBg = (p) => p>=80?'':p>=60?'bg-amber-50/50':'bg-red-50/50';

  const stats = activeMonth==='current'?curStats:prevStats;
  const monthLabel = activeMonth==='current'?`${MONTHS[curM]} ${curY}`:`${MONTHS[prevM]} ${prevY}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/beo" className="text-sm text-gov-navy hover:text-gov-saffron font-medium">← Back to Dashboard</Link>

      {/* School Header */}
      {school && <div className="gov-card p-6">
        <div className="flex items-start gap-4">
          <div className="logo-placeholder w-14 h-14 text-2xl shrink-0">🏫</div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gov-navy">{school.name}</h1>
            <p className="text-sm text-slate-500">{school.address}, Tal. {school.taluka}, Dist. {school.district}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
              <span>📞 {school.phone}</span>
              <span>👨‍🎓 {school.student_count} students</span>
              {school.map_link && <a href={school.map_link} target="_blank" rel="noreferrer" className="map-link">📍 View Map</a>}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2"><div className="avatar-placeholder avatar-sm">{school.headmaster_name?.[0]||'H'}</div>
              <div><div className="text-sm font-semibold">{school.headmaster_name}</div><div className="text-xs text-slate-400">Headmaster</div></div>
            </div>
          </div>
        </div>
      </div>}

      {/* Month Toggle */}
      <div className="flex gap-1 bg-white rounded-lg p-1 border border-slate-200 max-w-md">
        <button onClick={()=>setActiveMonth('current')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeMonth==='current'?'bg-gov-navy text-white':'text-slate-600 hover:bg-slate-100'}`}>{MONTHS[curM]} {curY}</button>
        <button onClick={()=>setActiveMonth('previous')} className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${activeMonth==='previous'?'bg-gov-navy text-white':'text-slate-600 hover:bg-slate-100'}`}>{MONTHS[prevM]} {prevY}</button>
      </div>

      {/* Summary */}
      {stats && <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card"><div className="stat-label">Teachers</div><div className="stat-value">{stats.total_teachers}</div></div>
        <div className="stat-card"><div className="stat-label">Working Days</div><div className="stat-value">{stats.working_days}</div></div>
        <div className="stat-card"><div className="stat-label">Avg Attendance</div><div className={`stat-value ${pctClr(stats.teachers?.reduce((a,t)=>a+t.attendance_percentage,0)/(stats.total_teachers||1))}`}>{Math.round(stats.teachers?.reduce((a,t)=>a+t.attendance_percentage,0)/(stats.total_teachers||1))}%</div></div>
        <div className="stat-card"><div className="stat-label">Flagged</div><div className="stat-value text-gov-red">{stats.teachers?.filter(t=>t.attendance_percentage<60).length}</div></div>
      </div>}

      {/* Teacher-wise Stats Table */}
      {stats && <div className="gov-card overflow-hidden">
        <table className="gov-table">
          <thead><tr><th>Teacher</th><th>Class</th><th>Present</th><th>Partial</th><th>Absent</th><th>%</th><th>Salary</th><th>Action</th></tr></thead>
          <tbody>{stats.teachers?.map(t=>(
            <tr key={t.teacher_id} className={rowBg(t.attendance_percentage)}>
              <td><div className="flex items-center gap-2"><div className="avatar-placeholder avatar-sm">{t.teacher_name?.[0]}</div><div><div className="text-sm font-medium">{t.teacher_name}</div><div className="text-[10px] text-slate-400">{t.username}</div></div></div></td>
              <td className="text-sm">Std {t.standard}{t.division}</td>
              <td className="text-sm text-gov-green font-medium">{t.present_days}</td>
              <td className="text-sm text-amber-600">{t.partial_days}</td>
              <td className="text-sm text-gov-red">{t.absent_days}</td>
              <td><span className={`font-bold ${pctClr(t.attendance_percentage)}`}>{t.attendance_percentage}%</span></td>
              <td>{t.salary_held?<span className="badge badge-held">🔒 Held</span>:t.salary_block_recommended?<span className="badge badge-absent">⚠️ Flag</span>:<span className="badge badge-present">✓ OK</span>}</td>
              <td className="space-x-1">
                {!t.salary_held?<button onClick={()=>holdSalary(t.teacher_id,t.teacher_name)} className="btn-danger !py-1 !px-2 !text-xs">Hold</button>
                :<button onClick={()=>releaseSalary(t.teacher_id,t.teacher_name)} className="btn-success !py-1 !px-2 !text-xs">Release</button>}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>}
    </div>
  );
};

export default SchoolDetail;
