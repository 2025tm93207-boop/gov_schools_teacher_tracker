import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import WebcamCapture from '../components/WebcamCapture';
import GeoLocationPrompt from '../components/GeoLocationPrompt';

const TeacherAttendance = () => {
  const [session, setSession] = useState(null);
  const [signedIn, setSignedIn] = useState(false);
  const [selfie, setSelfie] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [activeTab, setActiveTab] = useState('attendance');
  const [issueCategory, setIssueCategory] = useState('infrastructure');
  const [issueDesc, setIssueDesc] = useState('');
  const stored = JSON.parse(localStorage.getItem('user_data') || '{}');
  const school = stored.school;
  const teacher = stored.teacher;

  useEffect(() => { checkSession(); fetchMonthly(); }, []);

  const checkSession = async () => {
    try {
      const res = await axios.get('/api/attendance/sessions/today/?school_id=' + stored.school_id);
      setSession(res.data?.id ? res.data : null);
    } catch { setSession(null); }
  };

  const fetchMonthly = async () => {
    try {
      const now = new Date();
      const res = await axios.get(`/api/attendance/my-monthly/?month=${now.getMonth()+1}&year=${now.getFullYear()}`);
      setMonthly(res.data);
    } catch {}
  };

  const handleSignIn = async () => {
    if (!selfie||!lat||!lon) { toast.error('Capture selfie and location'); return; }
    try { await axios.post('/api/attendance/sign-in/',{selfie,lat,lon}); toast.success('Signed in!'); setSignedIn(true); } catch { toast.error('Error signing in'); }
  };
  const handleSignOut = async () => {
    if (!selfie) { toast.error('Capture selfie'); return; }
    try { await axios.post('/api/attendance/sign-out/',{selfie,lat,lon}); toast.success('Signed out!'); setSignedIn(false); } catch { toast.error('Error signing out'); }
  };
  const submitIssue = async () => {
    if (!issueDesc.trim()) { toast.error('Please describe the issue'); return; }
    try { await axios.post('/api/attendance/issues/',{category:issueCategory,description:issueDesc}); toast.success('Issue reported'); setIssueDesc(''); } catch { toast.error('Error reporting issue'); }
  };

  const badge = (s) => s==='Present'?<span className="badge badge-present">✓</span>:s==='Partial'?<span className="badge badge-partial">◐</span>:<span className="badge badge-absent">✗</span>;
  const pctClr = (p) => p>=80?'text-gov-green':p>=60?'text-amber-600':'text-gov-red';
  const barClr = (p) => p>=80?'progress-good':p>=60?'progress-medium':'progress-poor';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* School & Teacher Header */}
      <div className="gov-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 shrink-0">
            {school?.logo ? (
              <img src={school.logo} alt="School Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
            ) : null}
            <div className="logo-placeholder w-14 h-14 text-2xl items-center justify-center" style={{display: school?.logo ? 'none' : 'flex'}}>🏫</div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gov-navy">{school?.name}</h1>
            <p className="text-sm text-slate-500">{school?.address}, {school?.village}
              {school?.map_link && <a href={school.map_link} target="_blank" rel="noreferrer" className="map-link ml-2">📍Map</a>}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-gov-navy">{teacher?.full_name}</div>
            <div className="text-xs text-slate-500">Class: Std {teacher?.standard}{teacher?.division}</div>
          </div>
        </div>
      </div>

      {/* Salary Held Alert */}
      {teacher?.salary_held && (
        <div className="bg-red-50 border-2 border-gov-red rounded-xl p-4 animate-pulse flex items-center gap-4">
          <div className="text-3xl">⚠️</div>
          <div>
            <h3 className="text-gov-red font-bold">Salary Blocked</h3>
            <p className="text-sm text-red-700">Your salary has been blocked by the Block Education Office (BEO) due to low attendance. Please contact your BEO for clarification.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-lg p-1 border border-slate-200">
        {[{k:'attendance',l:'📋 Mark Attendance'},{k:'records',l:'📊 My Records'},{k:'issues',l:'⚠️ Report Issue'}].map(t=>(
          <button key={t.k} onClick={()=>setActiveTab(t.k)} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${activeTab===t.k?'bg-gov-navy text-white':'text-slate-600 hover:bg-slate-100'}`}>{t.l}</button>
        ))}
      </div>

      {/* Mark Attendance Tab */}
      {activeTab==='attendance' && <div className="animate-fade-in">
        {!session ? (
          <div className="gov-card p-8 text-center">
            <div className="text-4xl mb-3">📋</div>
            <h2 className="text-lg font-bold text-slate-700">No Active Session</h2>
            <p className="text-sm text-slate-500 mt-1">Please check with your headmaster to start today's attendance session.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="gov-card p-5">
              <h2 className="section-title">Selfie Capture</h2>
              <p className="text-xs text-slate-500 mb-3">Ensure at least 5 students visible in frame.</p>
              <WebcamCapture onCapture={setSelfie} />
            </div>
            <div className="gov-card p-5 space-y-5">
              <div>
                <h2 className="section-title">Location Verification</h2>
                <GeoLocationPrompt onLocation={(la,lo)=>{setLat(la);setLon(lo);}} />
              </div>
              <div className="space-y-3 pt-3 border-t border-slate-100">
                {!signedIn ? (
                  <button onClick={handleSignIn} className="btn-primary w-full !py-3">Sign In</button>
                ) : (
                  <button onClick={handleSignOut} className="btn-saffron w-full !py-3">Sign Out</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>}

      {/* My Records Tab */}
      {activeTab==='records' && monthly && <div className="animate-fade-in">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <div className="stat-card"><div className="stat-label">Working Days</div><div className="stat-value">{monthly.working_days}</div></div>
          <div className="stat-card"><div className="stat-label">Present</div><div className="stat-value text-gov-green">{monthly.present_days}</div></div>
          <div className="stat-card"><div className="stat-label">Partial</div><div className="stat-value text-amber-600">{monthly.partial_days}</div></div>
          <div className="stat-card">
            <div className="stat-label">Attendance</div>
            <div className={`stat-value ${pctClr(monthly.attendance_percentage)}`}>{monthly.attendance_percentage}%</div>
          </div>
        </div>
        <div className="progress-bar mb-5"><div className={`progress-fill ${barClr(monthly.attendance_percentage)}`} style={{width:`${monthly.attendance_percentage}%`}}/></div>
        <div className="gov-card overflow-hidden">
          <table className="gov-table"><thead><tr><th>Date</th><th>Day</th><th>In</th><th>Out</th><th>Status</th></tr></thead>
            <tbody>{monthly.records?.map(r=><tr key={r.date}><td className="text-sm">{r.date}</td><td className="text-sm text-slate-500">{r.day}</td><td className="text-sm">{r.sign_in_time||'—'}</td><td className="text-sm">{r.sign_out_time||'—'}</td><td>{badge(r.status)}</td></tr>)}</tbody>
          </table>
        </div>
      </div>}

      {/* Report Issue Tab */}
      {activeTab==='issues' && <div className="gov-card p-6 animate-fade-in max-w-xl">
        <h2 className="section-title">Report an Issue</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
            <select value={issueCategory} onChange={e=>setIssueCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-gov-navy focus:ring-2 focus:ring-gov-navy/20 outline-none">
              <option value="infrastructure">🏗️ Infrastructure</option>
              <option value="safety">🛡️ Safety</option>
              <option value="resource">📚 Resource Shortage</option>
              <option value="other">📝 Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea value={issueDesc} onChange={e=>setIssueDesc(e.target.value)} rows="4" placeholder="Describe the issue..."
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-gov-navy focus:ring-2 focus:ring-gov-navy/20 outline-none resize-none" />
          </div>
          <button onClick={submitIssue} className="btn-primary">Submit Report</button>
        </div>
      </div>}
    </div>
  );
};

export default TeacherAttendance;