import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me/').then(res => setUser(res.data)).catch(() => setUser(null));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('access');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/public" className="text-lg font-semibold uppercase tracking-wide">Gov School Attendance</Link>
        <div className="flex flex-wrap items-center gap-3">
          {user ? (
            <>
              <span className="text-slate-200">Welcome, {user.username}</span>
              <button onClick={logout} className="rounded-lg bg-saffron-600 px-4 py-2 text-slate-900 font-semibold transition hover:bg-saffron-700">Logout</button>
            </>
          ) : (
            <Link to="/login" className="rounded-lg bg-saffron-600 px-4 py-2 text-slate-900 font-semibold transition hover:bg-saffron-700">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;