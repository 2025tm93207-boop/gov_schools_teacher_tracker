import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/public" element={<PublicDashboard />} />
          <Route path="/headmaster" element={<ProtectedRoute role="headmaster"><HeadmasterDashboard /></ProtectedRoute>} />
          <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherAttendance /></ProtectedRoute>} />
          <Route path="/beo" element={<ProtectedRoute role="beo"><BEODashboard /></ProtectedRoute>} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;