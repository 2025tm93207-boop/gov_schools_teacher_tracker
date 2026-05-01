import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login/', credentials);
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('user_data', JSON.stringify(res.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
      toast.success(`Welcome, ${res.data.user.full_name || res.data.user.username}`);
      if (res.data.user.role === 'headmaster') navigate('/headmaster');
      else if (res.data.user.role === 'teacher') navigate('/teacher');
      else if (res.data.user.role === 'beo') navigate('/beo');
    } catch (err) {
      toast.error('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogins = [
    { label: 'Headmaster (Nandre)', username: 'hm_nandre' },
    { label: 'Teacher (Nandre)', username: 'teacher1_nandre' },
    { label: 'BEO (Dhule)', username: 'beo_dhule' },
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-md">
        {/* Header Card */}
        <div className="text-center mb-6">
          <div className="logo-placeholder w-20 h-20 mx-auto mb-4 text-2xl">🏛️</div>
          <h1 className="text-2xl font-bold text-gov-navy">Official Login Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Zilla Parishad Primary Schools, Dhule District</p>
        </div>

        {/* Login Form */}
        <div className="gov-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
              <input
                id="login-username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-gov-navy focus:outline-none focus:ring-2 focus:ring-gov-navy/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-gov-navy focus:outline-none focus:ring-2 focus:ring-gov-navy/20 transition-all"
                required
              />
            </div>
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 !text-base disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Login for Demo */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Demo Login</p>
            <div className="grid gap-2">
              {quickLogins.map((ql) => (
                <button
                  key={ql.username}
                  onClick={() => {
                    setCredentials({ username: ql.username, password: 'Test@123' });
                  }}
                  className="text-left text-xs px-3 py-2 rounded-lg border border-slate-200 hover:border-gov-navy hover:bg-gov-navy/5 transition-all text-slate-600 hover:text-gov-navy"
                >
                  <span className="font-semibold">{ql.label}</span>
                  <span className="text-slate-400 ml-2">({ql.username})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Public Dashboard Link */}
        <div className="text-center mt-5">
          <Link to="/public" className="text-sm text-gov-navy hover:text-gov-saffron font-medium transition-colors">
            📊 View Public Transparency Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;