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
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link to="/public" className="text-xl font-bold">Attendance System</Link>
        <div>
          {user ? (
            <>
              <span>Welcome, {user.username}</span>
              <button onClick={logout} className="ml-4 bg-red-500 px-4 py-2 rounded">Logout</button>
            </>
          ) : (
            <Link to="/login" className="bg-green-500 px-4 py-2 rounded">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;