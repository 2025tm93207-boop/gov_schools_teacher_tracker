import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import HeadmasterDashboard from './pages/HeadmasterDashboard';
import TeacherAttendance from './pages/TeacherAttendance';
import BEODashboard from './pages/BEODashboard';
import PublicDashboard from './pages/PublicDashboard';
import SchoolDetail from './pages/SchoolDetail';
import PublicSchoolDetail from './pages/PublicSchoolDetail';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Navigate to="/public" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/public" element={<PublicDashboard />} />
            <Route path="/public/school/:id" element={<PublicSchoolDetail />} />
            <Route path="/headmaster" element={<ProtectedRoute role="headmaster"><HeadmasterDashboard /></ProtectedRoute>} />
            <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherAttendance /></ProtectedRoute>} />
            <Route path="/beo" element={<ProtectedRoute role="beo"><BEODashboard /></ProtectedRoute>} />
            <Route path="/beo/school/:id" element={<ProtectedRoute role="beo"><SchoolDetail /></ProtectedRoute>} />
          </Routes>
        </main>
        <footer className="gov-footer">
          <p>© 2026 Zilla Parishad, Dhule District — Education Department, Maharashtra</p>
          <p className="mt-1 text-white/50">Developed under Digital India Initiative for Government School Transparency</p>
        </footer>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Noto Sans', fontSize: '14px' } }} />
      </div>
    </Router>
  );
}

export default App;