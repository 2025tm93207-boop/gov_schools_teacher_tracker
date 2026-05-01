import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const HeadmasterDashboard = () => {
  const [teachers, setTeachers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [teacherStats, setTeacherStats] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const stored = JSON.parse(localStorage.getItem('user_data') || '{}');
  const school = stored.school;
  const schoolId = stored.school_id;

  useEffect(() => { if (schoolId) { fetchToday(); fetchDivisions(); } }, []);

  const fetchToday = async () => {
    try {
      const res = await axios.get(`/api/attendance/school/${schoolId}/today/`);
      setTeachers(res.data.teachers || []);
      setSessionActive(res.data.session_active || false);
    } catch { toast.error('Error fetching data'); }
  };

  const fetchDivisions = async () => {
    try { const res = await axios.get(`/api/schools/${schoolId}/divisions/`); setDivisions(res.data); } catch {}
  };

  const fetchTeacherStats = async (tId) => {
    const now = new Date();
    try {
      const res = await axios.get(`/api/attendance/teacher/${tId}/monthly/?month=${now.getMonth()+1}&year=${now.getFullYear()}`);
      setTeacherStats(res.data);
    } catch { toast.error('Error fetching stats'); }
  };

  const startSession = async () => {
    const now = new Date();
    try {
      await axios.post('/api/attendance/sessions/', {
        date: now.toISOString().split('T')[0],
        start_time: now.toTimeString().split(' ')[0],
        end_time: new Date(now.getTime()+30*60000).toTimeString().split(' ')[0],
      });
      toast.success('Session started'); fetchToday();
    } catch { toast.error('Error starting session'); }
  };

  const badge = (s) => s==='Present'?<span className="badge badge-present">✓ Present</span>:s==='Partial'?<span className="badge badge-partial">◐ Partial</span>:s==='No Session'?<span className="badge bg-slate-100 text-slate-500">—</span>:<span className="badge badge-absent">✗ Absent</span>;
  const pctClr = (p) => p>=80?'text-gov-green':p>=60?'text-amber-600':'text-gov-red';
  const barClr = (p) => p>=80?'progress-good':p>=60?'progress-medium':'progress-poor';

  const grouped = {};
  divisions.forEach(d => { if (!grouped[d.standard]) grouped[d.standard]=[]; grouped[d.standard].push(d); });

  const pres = teachers.filter(t=>t.status==='Present').length;
  const part = teachers.filter(t=>t.status==='Partial').length;
  const abs = teachers.filter(t=>t.status==='Absent').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* School Header */}
      <div className="gov-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="logo-placeholder w-14 h-14 text-2xl shrink-0">🏫</div>
            <div>
              <h1 className="text-xl font-bold text-gov-navy">{school?.name||'Dashboard'}</h1>
              <p className="text-sm text-slate-500">{school?.address}, {school?.village}, {school?.district}
                {school?.map_link && <a href={school.map_link} target="_blank" rel="noreferrer" className="map-link ml-2">📍Map</a>}
              </p>
              <p className="text-xs text-slate-400">Students: <strong>{school?.student_count}</strong></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Today</div>
              <div className="text-sm font-bold text-gov-navy">{new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</div>
            </div>
            <button onClick={startSession} disabled={sessionActive} className={`btn-saffron ${sessionActive?'opacity-50 cursor-not-allowed':''}`}>
              {sessionActive?'✓ Session Active':'▶ Start Attendance'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-lg p-1 border border-slate-200">
        {[{k:'today',l:"📋 Today"},{k:'classes',l:'🏛️ Classes'},{k:'records',l:'📊 Records'}].map(t=>(
          <button key={t.k} onClick={()=>setActiveTab(t.k)} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${activeTab===t.k?'bg-gov-navy text-white':'text-slate-600 hover:bg-slate-100'}`}>{t.l}</button>
        ))}
      </div>

      {/* Today Tab */}
      {activeTab==='today' && <div className="animate-fade-in">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value">{teachers.length}</div></div>
          <div className="stat-card"><div className="stat-label">Present</div><div className="stat-value text-gov-green">{pres}</div></div>
          <div className="stat-card"><div className="stat-label">Partial</div><div className="stat-value text-amber-600">{part}</div></div>
          <div className="stat-card"><div className="stat-label">Absent</div><div className="stat-value text-gov-red">{abs}</div></div>
        </div>
        <div className="gov-card overflow-hidden">
          <table className="gov-table"><thead><tr><th>Teacher</th><th>Class</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
          <tbody>{teachers.length===0?<tr><td colSpan="5" className="text-center py-8 text-slate-400">No data. Start session first.</td></tr>:
            teachers.map(t=><tr key={t.teacher}><td><div className="flex items-center gap-2"><div className="avatar-placeholder avatar-sm">{t.teacher_name?.[0]||'?'}</div><div><div className="font-medium text-sm">{t.teacher_name||t.teacher}</div><div className="text-xs text-slate-400">{t.teacher}</div></div></div></td>
              <td className="text-sm">Std {t.standard}{t.division}</td><td className="text-sm">{t.sign_in_time||'—'}</td><td className="text-sm">{t.sign_out_time||'—'}</td><td>{badge(t.status)}</td></tr>)
          }</tbody></table>
        </div>
      </div>}

      {/* Classes Tab */}
      {activeTab==='classes' && <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {Object.keys(grouped).sort().map(std=><div key={std} className="gov-card p-5">
          <div className="flex items-center gap-2 mb-3"><div className="w-10 h-10 rounded-lg bg-gov-navy/10 text-gov-navy font-bold flex items-center justify-center">{std}</div><h3 className="font-bold text-gov-navy">Standard {std}</h3></div>
          <div className="space-y-2">{grouped[std].map(d=><div key={d.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex justify-between mb-1"><span className="font-semibold text-sm">Div {d.division}</span><span className="text-xs text-slate-400">{d.student_count} students</span></div>
            <div className="flex items-center gap-2"><div className="avatar-placeholder w-6 h-6 text-[10px]">{d.teacher_name?.[0]||'?'}</div><span className="text-xs text-slate-600">{d.teacher_name||'Unassigned'}</span></div>
          </div>)}</div>
        </div>)}
      </div>}

      {/* Records Tab */}
      {activeTab==='records' && <div className="animate-fade-in">
        <div className="gov-card p-5 mb-4">
          <h3 className="section-title">Select Teacher</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {divisions.filter(d=>d.teacher_name).map(d=><button key={d.id} onClick={()=>fetchTeacherStats(d.teacher_id||d.id)}
              className="text-left p-3 rounded-lg border border-slate-200 hover:border-gov-navy/50 hover:bg-slate-50 transition-all">
              <div className="flex items-center gap-2"><div className="avatar-placeholder avatar-sm">{d.teacher_name?.[0]}</div><div><div className="text-sm font-medium">{d.teacher_name}</div><div className="text-xs text-slate-400">Std {d.standard}{d.division}</div></div></div>
            </button>)}
          </div>
        </div>
        {teacherStats && <div className="gov-card p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-lg font-bold text-gov-navy">{teacherStats.teacher_name}</h3><p className="text-sm text-slate-500">Std {teacherStats.standard}{teacherStats.division} — {MONTHS[teacherStats.month]} {teacherStats.year}</p></div>
            <div className="text-right"><div className={`text-3xl font-bold ${pctClr(teacherStats.attendance_percentage)}`}>{teacherStats.attendance_percentage}%</div><div className="text-xs text-slate-400">Attendance</div></div>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="stat-card !p-3"><div className="stat-label text-[10px]">Working</div><div className="stat-value !text-xl">{teacherStats.working_days}</div></div>
            <div className="stat-card !p-3"><div className="stat-label text-[10px]">Present</div><div className="stat-value !text-xl text-gov-green">{teacherStats.present_days}</div></div>
            <div className="stat-card !p-3"><div className="stat-label text-[10px]">Partial</div><div className="stat-value !text-xl text-amber-600">{teacherStats.partial_days}</div></div>
            <div className="stat-card !p-3"><div className="stat-label text-[10px]">Absent</div><div className="stat-value !text-xl text-gov-red">{teacherStats.absent_days}</div></div>
          </div>
          <div className="progress-bar mb-4"><div className={`progress-fill ${barClr(teacherStats.attendance_percentage)}`} style={{width:`${teacherStats.attendance_percentage}%`}}/></div>
          <div className="max-h-60 overflow-y-auto"><table className="gov-table"><thead><tr><th>Date</th><th>Day</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
            <tbody>{teacherStats.records?.map(r=><tr key={r.date}><td className="text-sm">{r.date}</td><td className="text-sm text-slate-500">{r.day}</td><td className="text-sm">{r.sign_in_time||'—'}</td><td className="text-sm">{r.sign_out_time||'—'}</td><td>{badge(r.status)}</td></tr>)}</tbody>
          </table></div>
          {teacherStats.salary_block_recommended && <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-gov-red font-medium">⚠️ Salary block recommended — Below 60%</div>}
        </div>}
      </div>}
    </div>
  );
};

export default HeadmasterDashboard;