import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login/', credentials);
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('school_id', res.data.user.school_id || '');
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
      toast.success('Logged in');
      if (res.data.user.role === 'headmaster') navigate('/headmaster');
      else if (res.data.user.role === 'teacher') navigate('/teacher');
      else if (res.data.user.role === 'beo') navigate('/beo');
    } catch (err) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-slate-300 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold text-slate-900 mb-6">Headmaster & Teacher Login</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
          <input
            type="text"
            placeholder="Enter username"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-saffron-600 focus:outline-none focus:ring-2 focus:ring-saffron-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-saffron-600 focus:outline-none focus:ring-2 focus:ring-saffron-100"
            required
          />
        </div>
        <button type="submit" className="w-full rounded-lg bg-saffron-600 px-4 py-3 font-semibold text-white transition hover:bg-saffron-700">Login</button>
      </form>
    </div>
  );
};

export default Login;