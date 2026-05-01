import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import HeadmasterDashboard from './pages/HeadmasterDashboard';
import TeacherAttendance from './pages/TeacherAttendance';
import BEODashboard from './pages/BEODashboard';
import PublicDashboard from './pages/PublicDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/public" element={<PublicDashboard />} />
            <Route path="/headmaster" element={<ProtectedRoute role="headmaster"><HeadmasterDashboard /></ProtectedRoute>} />
            <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherAttendance /></ProtectedRoute>} />
            <Route path="/beo" element={<ProtectedRoute role="beo"><BEODashboard /></ProtectedRoute>} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;