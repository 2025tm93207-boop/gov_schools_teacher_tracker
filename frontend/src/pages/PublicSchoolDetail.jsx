import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const MONTHS = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const PublicSchoolDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/public/school/${id}/details/`).then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const pctClr = (p) => p>=80?'text-gov-green':p>=60?'text-amber-600':'text-gov-red';
  const barClr = (p) => p>=80?'progress-good':p>=60?'progress-medium':'progress-poor';

  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>;
  if (!data) return <div className="text-center py-20 text-slate-400">School not found.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link to="/public" className="text-sm text-gov-navy hover:text-gov-saffron font-medium">← Back to Dashboard</Link>

      {/* School Header */}
      <div className="gov-card p-6">
        <div className="flex items-start gap-4">
          <div className="logo-placeholder w-16 h-16 text-2xl shrink-0">🏫</div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gov-navy">{data.name}</h1>
            <p className="text-sm text-slate-500">{data.address}, {data.village}, Dist. {data.district}, {data.state}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
              <span>📞 {data.phone}</span>
              <span>👨‍🎓 {data.student_count} students</span>
              <span>🏗️ Est. {data.established_year}</span>
              {data.map_link && <a href={data.map_link} target="_blank" rel="noreferrer" className="map-link">📍 View on Map</a>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
            <div className="avatar-placeholder avatar-sm">{data.headmaster_name?.[0]||'H'}</div>
            <div><div className="text-sm font-semibold">{data.headmaster_name||'—'}</div><div className="text-[10px] text-slate-400">Headmaster</div></div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
            <div className="avatar-placeholder avatar-sm">{data.beo_name?.[0]||'B'}</div>
            <div><div className="text-sm font-semibold">{data.beo_name||'—'}</div><div className="text-[10px] text-slate-400">Block Education Officer</div></div>
          </div>
        </div>
      </div>

      {/* Monthly Reports */}
      {data.months?.map((m, idx) => (
        <div key={idx}>
          <h2 className="section-title">{MONTHS[m.month]} {m.year} — {m.working_days} Working Days • Avg: {m.average_attendance}%</h2>
          <div className="gov-card overflow-hidden">
            <table className="gov-table">
              <thead><tr><th>Teacher</th><th>Class</th><th>Present</th><th>Partial</th><th>Absent</th><th>Working</th><th>Attendance</th></tr></thead>
              <tbody>
                {m.teachers?.map((t,i) => (
                  <tr key={i}>
                    <td><div className="flex items-center gap-2"><div className="avatar-placeholder avatar-sm">{t.teacher_name?.[0]}</div><span className="text-sm font-medium">{t.teacher_name}</span></div></td>
                    <td className="text-sm">Std {t.standard}{t.division}</td>
                    <td className="text-sm text-gov-green font-medium">{t.present_days}</td>
                    <td className="text-sm text-amber-600">{t.partial_days}</td>
                    <td className="text-sm text-gov-red">{t.absent_days}</td>
                    <td className="text-sm">{t.working_days}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-16"><div className={`progress-fill ${barClr(t.attendance_percentage)}`} style={{width:`${t.attendance_percentage}%`}}/></div>
                        <span className={`font-bold text-sm ${pctClr(t.attendance_percentage)}`}>{t.attendance_percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PublicSchoolDetail;
