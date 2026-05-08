import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me/').then(res => setUser(res.data)).catch(() => setUser(null));
    }
  }, [location.pathname]);

  const logout = () => {
    localStorage.clear();
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
  };

  const stored = JSON.parse(localStorage.getItem('user_data') || '{}');
  const school = stored.school || user?.school;
  const roleName = user?.role === 'headmaster' ? 'Headmaster' : user?.role === 'teacher' ? 'Teacher' : user?.role === 'beo' ? 'Block Education Officer' : '';
  const displayName = user?.full_name || user?.username || '';

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <header>
      {/* Top utility bar */}
      <div className="bg-slate-900 text-white/80 text-[10px] py-1 px-4 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="hidden sm:block">Government of Maharashtra</div>
        <div className="flex items-center gap-3 ml-auto">
          <button className="hover:text-white transition-colors">A- | A | A+</button>
          <div className="w-px h-3 bg-white/30"></div>
          <button className="flex items-center gap-1 hover:text-white transition-colors">
            🌐 English / मराठी
          </button>
        </div>
      </div>

      {/* Tricolor Bar */}
      <div className="tricolor-bar" />

      {/* Main Government Header */}
      <div className="gov-header">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Emblem + Title */}
            <Link to={user ? `/${user.role === 'beo' ? 'beo' : user.role}` : '/public'} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="logo-placeholder w-12 h-12 !bg-white/20 !border-white/30 !text-white text-lg shrink-0">
                🇮🇳
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold leading-tight truncate">
                  Teacher Attendance Transparency Portal
                </h1>
                <p className="text-[10px] sm:text-xs text-white/70 leading-tight">
                  Zilla Parishad Education Department, Dhule District, Maharashtra
                </p>
              </div>
            </Link>

            {/* Right: User info + actions */}
            <div className="flex items-center gap-3 shrink-0">
              {user ? (
                <>
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium">{displayName}</div>
                    <div className="badge-role">{roleName}</div>
                  </div>
                  <div className="avatar-placeholder avatar-sm !bg-white/20 !text-white">
                    {getInitials(displayName)}
                  </div>
                  <button onClick={logout} className="btn-saffron !py-1.5 !px-3 !text-xs">
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/public" className="text-white/80 hover:text-white text-xs font-medium transition-colors">
                    Public Dashboard
                  </Link>
                  <Link to="/login" className="btn-saffron !py-1.5 !px-3 !text-xs">
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* School context bar for logged-in HM/Teacher */}
          {user && school && (
            <div className="mt-2 pt-2 border-t border-white/15 flex items-center gap-3 text-xs text-white/80">
              <div className="logo-placeholder w-7 h-7 !bg-white/15 !border-white/25 !text-white text-[10px] shrink-0">
                🏫
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-white">{school.name}</span>
                <span className="hidden sm:inline"> — {school.address}, {school.village}, {school.district}</span>
              </div>
              {school.map_link && (
                <a href={school.map_link} target="_blank" rel="noreferrer" className="map-link !text-white/70 hover:!text-gov-saffron shrink-0">
                  📍 Map
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom tricolor */}
      <div className="tricolor-bar" />
    </header>
  );
};

export default Navbar;