import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import ProtectedLayout from './components/ProtectedLayout';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import RegisterStudent from './pages/RegisterStudent';
import TakeAttendance from './pages/TakeAttendance';
import History from './pages/History';
import SessionDetails from './pages/SessionDetails';
import Students from './pages/Students';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/new" element={<RegisterStudent />} />
            <Route path="/attendance/new" element={<TakeAttendance />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/:sessionId" element={<SessionDetails />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
