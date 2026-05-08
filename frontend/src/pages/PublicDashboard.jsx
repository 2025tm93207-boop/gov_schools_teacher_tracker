import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PublicDashboard = () => {
  const [schools, setSchools] = useState([]);
  const [awards, setAwards] = useState([]);
  const [redFlags, setRedFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const month = now.getMonth()+1, year = now.getFullYear();
  // Use previous month if current month has very few days
  const useMonth = now.getDate() <= 2 ? (month===1?12:month-1) : month;
  const useYear = now.getDate() <= 2 && month === 1 ? year - 1 : year;

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [schoolsRes, awardsRes, flagsRes] = await Promise.all([
        axios.get(`/api/public/schools/stats/?month=${useMonth}&year=${useYear}`),
        axios.get(`/api/public/awards/?month=${useMonth}&year=${useYear}`),
        axios.get(`/api/public/red-flags/?month=${useMonth}&year=${useYear}`),
      ]);
      setSchools(schoolsRes.data);
      setAwards(awardsRes.data);
      setRedFlags(flagsRes.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const pctClr = (p) => p>=80?'text-gov-green':p>=60?'text-amber-600':'text-gov-red';
  const barClr = (p) => p>=80?'progress-good':p>=60?'progress-medium':'progress-poor';

  const totalStudents = schools.reduce((a,s)=>a+s.student_count,0);
  const totalTeachers = schools.reduce((a,s)=>a+s.teacher_count,0);
  const avgAtt = schools.length>0?Math.round(schools.reduce((a,s)=>a+s.average_attendance,0)/schools.length):0;

  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* District Header */}
      <div className="gov-card p-6 bg-gradient-to-r from-gov-navy to-gov-navy-light text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 shrink-0 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 text-3xl">🏛️</div>
          <div>
            <h1 className="text-xl font-bold">Dhule District — Government Primary Schools</h1>
            <p className="text-sm text-white/70">Transparency Dashboard • Zilla Parishad Education Department • {MONTHS[useMonth]} {useYear}</p>
            <p className="text-xs text-white/50 mt-1">Promoting accountability in teacher attendance for quality education</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card"><div className="stat-label">Schools</div><div className="stat-value">{schools.length}</div></div>
        <div className="stat-card"><div className="stat-label">Teachers</div><div className="stat-value">{totalTeachers}</div></div>
        <div className="stat-card"><div className="stat-label">Students</div><div className="stat-value">{totalStudents}</div></div>
        <div className="stat-card"><div className="stat-label">Avg Attendance</div><div className={`stat-value ${pctClr(avgAtt)}`}>{avgAtt}%</div></div>
      </div>

      {/* Awards Section */}
      {awards.length>0 && <div>
        <h2 className="section-title">🏆 Top Performing Schools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {awards.map(a=>(
            <Link to={`/public/school/${a.id}`} key={a.id} className="award-card hover:shadow-lg transition-shadow group">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🏅</span>
                <div>
                  <h3 className="font-bold text-amber-900 group-hover:text-gov-saffron transition-colors">{a.name}</h3>
                  <p className="text-xs text-amber-700">{a.village} • HM: {a.headmaster_name}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-amber-800">{a.student_count} students</span>
                <span className="text-xl font-bold text-gov-green">{a.average_attendance}%</span>
              </div>
            </Link>
          ))}
        </div>
      </div>}

      {/* Red Flags */}
      {redFlags.length>0 && <div>
        <h2 className="section-title">🚩 Schools Needing Attention</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {redFlags.map(f=>(
            <Link to={`/public/school/${f.id}`} key={f.id} className="redflag-card hover:shadow-lg transition-shadow group">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h3 className="font-bold text-red-900 group-hover:text-gov-red transition-colors">{f.name}</h3>
                  <p className="text-xs text-red-700">{f.village} • HM: {f.headmaster_name}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-red-800">{f.student_count} students</span>
                <span className="text-xl font-bold text-gov-red">{f.average_attendance}%</span>
              </div>
              {f.flagged_teachers?.length>0 && <div className="text-xs text-red-700 bg-red-100 rounded p-2">
                Flagged: {f.flagged_teachers.map(t=>t.name).join(', ')}
              </div>}
            </Link>
          ))}
        </div>
      </div>}

      {/* All Schools */}
      <div>
        <h2 className="section-title">📊 All Schools — Teacher Attendance Overview</h2>
        <div className="space-y-4">
          {schools.map(s=>(
            <Link to={`/public/school/${s.id}`} key={s.id} className="gov-card p-5 block hover:border-gov-navy/30 group">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* School Info */}
                <div className="flex items-start gap-3 lg:w-1/3">
                  <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-slate-100">
                    {s.logo ? (
                      <img src={s.logo} alt="School" className="w-full h-full object-contain" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    ) : null}
                    <div className="logo-placeholder w-full h-full text-xl items-center justify-center bg-slate-50" style={{display: s.logo ? 'none' : 'flex'}}>🏫</div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gov-navy group-hover:text-gov-saffron transition-colors">{s.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{s.address}</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-slate-400">
                      <span>HM: {s.headmaster_name}</span>
                      <span>BEO: {s.beo_name}</span>
                      <span>👨‍🎓 {s.student_count}</span>
                    </div>
                    {s.map_link && <a href={s.map_link} target="_blank" rel="noreferrer" className="map-link text-[10px]" onClick={e=>e.stopPropagation()}>📍Map</a>}
                  </div>
                </div>

                {/* Teacher-wise attendance mini table */}
                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="text-slate-400 border-b border-slate-100">
                      <th className="text-left py-1 pr-2">Teacher</th><th className="text-left py-1 pr-2">Class</th><th className="text-right py-1">Attendance</th>
                    </tr></thead>
                    <tbody>{s.teachers?.slice(0,6).map((t,i)=>(
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-1 pr-2">{t.teacher_name}</td>
                        <td className="py-1 pr-2 text-slate-400">Std {t.standard}{t.division}</td>
                        <td className={`py-1 text-right font-semibold ${pctClr(t.attendance_percentage)}`}>{t.attendance_percentage}%</td>
                      </tr>
                    ))}</tbody>
                  </table>
                  {s.teachers?.length>6 && <p className="text-[10px] text-slate-400 mt-1">+{s.teachers.length-6} more</p>}
                </div>

                {/* Overall */}
                <div className="lg:w-28 text-center shrink-0">
                  <div className={`text-2xl font-bold ${pctClr(s.average_attendance)}`}>{s.average_attendance}%</div>
                  <div className="text-[10px] text-slate-400 uppercase">Average</div>
                  <div className="progress-bar mt-1"><div className={`progress-fill ${barClr(s.average_attendance)}`} style={{width:`${s.average_attendance}%`}}/></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicDashboard;